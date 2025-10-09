// src/lib/rate-limiter.ts
import { db } from "./db";

export class RateLimiter {
  async checkRateLimit(apiKeyId: string, userId: string): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    limitType: string;
  }> {
    const now = new Date();
    
    // Get the API key with its rate limits
    const apiKey = await db.apiKey.findUnique({
      where: { id: apiKeyId },
      select: {
        rateLimitPerMinute: true,
        rateLimitPerHour: true,
        rateLimitPerDay: true,
      }
    });

    if (!apiKey) {
      throw new Error("API key not found");
    }

    // Check minute limit
    const minuteWindow = this.getWindowStart(now, 'minute');
    const minuteLimit = await this.getAndUpdateRateLimit(
      apiKeyId, 
      userId, 
      'minute', 
      minuteWindow, 
      apiKey.rateLimitPerMinute
    );

    if (!minuteLimit.allowed) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(minuteWindow.getTime() + 60000),
        limitType: 'minute'
      };
    }

    // Check hour limit
    const hourWindow = this.getWindowStart(now, 'hour');
    const hourLimit = await this.getAndUpdateRateLimit(
      apiKeyId, 
      userId, 
      'hour', 
      hourWindow, 
      apiKey.rateLimitPerHour
    );

    if (!hourLimit.allowed) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(hourWindow.getTime() + 3600000),
        limitType: 'hour'
      };
    }

    // Check day limit
    const dayWindow = this.getWindowStart(now, 'day');
    const dayLimit = await this.getAndUpdateRateLimit(
      apiKeyId, 
      userId, 
      'day', 
      dayWindow, 
      apiKey.rateLimitPerDay
    );

    if (!dayLimit.allowed) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: new Date(dayWindow.getTime() + 86400000),
        limitType: 'day'
      };
    }

    // Return the most restrictive limit
    const limits = [minuteLimit, hourLimit, dayLimit];
    const mostRestrictive = limits.reduce((min, current) => 
      current.remaining < min.remaining ? current : min
    );

    return {
      allowed: true,
      remaining: mostRestrictive.remaining,
      resetTime: mostRestrictive.resetTime,
      limitType: mostRestrictive.windowType
    };
  }

  private async getAndUpdateRateLimit(
    apiKeyId: string,
    userId: string,
    windowType: string,
    windowStart: Date,
    limit: number
  ): Promise<{
    allowed: boolean;
    remaining: number;
    resetTime: Date;
    windowType: string;
  }> {
    // Use a transaction to ensure atomicity
    const result = await db.$transaction(async (tx) => {
      // Find or create the rate limit record
      const rateLimit = await tx.rateLimit.findUnique({
        where: {
          apiKeyId_windowType_windowStart: {
            apiKeyId,
            windowType,
            windowStart
          }
        }
      });

      if (!rateLimit) {
        // Create new rate limit record
        await tx.rateLimit.create({
          data: {
            apiKeyId,
            userId,
            windowType,
            windowStart,
            requestCount: 1
          }
        });

        return {
          allowed: true,
          remaining: limit - 1,
          resetTime: this.getResetTime(windowStart, windowType),
          windowType
        };
      }

      // Check if limit is exceeded
      if (rateLimit.requestCount >= limit) {
        return {
          allowed: false,
          remaining: 0,
          resetTime: this.getResetTime(windowStart, windowType),
          windowType
        };
      }

      // Increment the request count
      await tx.rateLimit.update({
        where: { id: rateLimit.id },
        data: {
          requestCount: rateLimit.requestCount + 1,
          updatedAt: new Date()
        }
      });

      return {
        allowed: true,
        remaining: limit - (rateLimit.requestCount + 1),
        resetTime: this.getResetTime(windowStart, windowType),
        windowType
      };
    });

    return result;
  }

  private getWindowStart(now: Date, windowType: string): Date {
    const windowStart = new Date(now);
    
    switch (windowType) {
      case 'minute':
        windowStart.setSeconds(0, 0);
        break;
      case 'hour':
        windowStart.setMinutes(0, 0, 0);
        break;
      case 'day':
        windowStart.setHours(0, 0, 0, 0);
        break;
    }
    
    return windowStart;
  }

  private getResetTime(windowStart: Date, windowType: string): Date {
    const resetTime = new Date(windowStart);
    
    switch (windowType) {
      case 'minute':
        resetTime.setMinutes(resetTime.getMinutes() + 1);
        break;
      case 'hour':
        resetTime.setHours(resetTime.getHours() + 1);
        break;
      case 'day':
        resetTime.setDate(resetTime.getDate() + 1);
        break;
    }
    
    return resetTime;
  }

  async initializeRateLimits(apiKeyId: string, userId: string, limits: {
    perMinute: number;
    perHour: number;
    perDay: number;
  }) {
    const now = new Date();
    
    // Initialize rate limits for each window type
    await Promise.all([
      db.rateLimit.create({
        data: {
          apiKeyId,
          userId,
          windowType: 'minute',
          windowStart: this.getWindowStart(now, 'minute'),
          requestCount: 0
        }
      }),
      db.rateLimit.create({
        data: {
          apiKeyId,
          userId,
          windowType: 'hour',
          windowStart: this.getWindowStart(now, 'hour'),
          requestCount: 0
        }
      }),
      db.rateLimit.create({
        data: {
          apiKeyId,
          userId,
          windowType: 'day',
          windowStart: this.getWindowStart(now, 'day'),
          requestCount: 0
        }
      })
    ]);
  }

  async getRateLimitStatus(apiKeyId: string, userId: string) {
    const now = new Date();
    
    const apiKey = await db.apiKey.findUnique({
      where: { id: apiKeyId },
      select: {
        rateLimitPerMinute: true,
        rateLimitPerHour: true,
        rateLimitPerDay: true,
      }
    });

    if (!apiKey) {
      throw new Error("API key not found");
    }

    const [minuteStatus, hourStatus, dayStatus] = await Promise.all([
      this.getCurrentStatus(apiKeyId, userId, 'minute', this.getWindowStart(now, 'minute'), apiKey.rateLimitPerMinute),
      this.getCurrentStatus(apiKeyId, userId, 'hour', this.getWindowStart(now, 'hour'), apiKey.rateLimitPerHour),
      this.getCurrentStatus(apiKeyId, userId, 'day', this.getWindowStart(now, 'day'), apiKey.rateLimitPerDay)
    ]);

    return {
      minute: minuteStatus,
      hour: hourStatus,
      day: dayStatus
    };
  }

  private async getCurrentStatus(
    apiKeyId: string,
    userId: string,
    windowType: string,
    windowStart: Date,
    limit: number
  ) {
    const rateLimit = await db.rateLimit.findUnique({
      where: {
        apiKeyId_windowType_windowStart: {
          apiKeyId,
          windowType,
          windowStart
        }
      }
    });

    const used = rateLimit?.requestCount || 0;
    
    return {
      limit,
      used,
      remaining: Math.max(0, limit - used),
      resetTime: this.getResetTime(windowStart, windowType),
      windowType
    };
  }
}
