import { OnModuleInit } from '@nestjs/common';
declare const PrismaService_base: any;
export declare class PrismaService extends PrismaService_base implements OnModuleInit {
    constructor();
    onModuleInit(): Promise<void>;
    connectWithDiagnostics(): Promise<{
        success: boolean;
        error?: undefined;
    } | {
        success: boolean;
        error: any;
    }>;
    checkHealth(): Promise<{
        status: string;
        latency: string;
        metadata: any;
        message?: undefined;
        code?: undefined;
    } | {
        status: string;
        latency: string;
        message: any;
        code: any;
        metadata?: undefined;
    }>;
}
export {};
