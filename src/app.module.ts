import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { ThrottlerModule } from '@nestjs/throttler';
import { PrismaModule } from './prisma/prisma.module';
import { AuthModule } from './auth/auth.module';
import { CitizensModule } from './citizens/citizens.module';
import { LocationsModule } from './locations/locations.module';
import { LeadersModule } from './leaders/leaders.module';
import { AnnouncementsModule } from './announcements/announcements.module';
import { ServicesModule } from './services/services.module';
import { VisitorsModule } from './visitors/visitors.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: '.env',
    }),
    ThrottlerModule.forRoot([
      {
        name: 'default',
        ttl: 60000, // 1 minute in milliseconds
        limit: 100, // 100 requests per minute per IP
      },
    ]),
    PrismaModule,
    AuthModule,
    CitizensModule,
    LocationsModule,
    LeadersModule,
    AnnouncementsModule,
    ServicesModule,
    VisitorsModule,
  ],
  controllers: [],
  providers: [],
})
export class AppModule {}
