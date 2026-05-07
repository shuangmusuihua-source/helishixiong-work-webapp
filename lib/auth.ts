import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";
import { PrismaClient } from "@prisma/client";
import { phoneNumber } from "better-auth/plugins/phone-number";

const prisma = new PrismaClient();

export const auth = betterAuth({
  // 应用配置
  appName: "河狸师兄",

  // 数据库配置 - 使用 Prisma 适配器
  database: prismaAdapter(prisma, {
    provider: "sqlite",
  }),

  // 邮箱密码登录（可选，作为备用登录方式）
  emailAndPassword: {
    enabled: true,
  },

  // 手机号插件
  plugins: [
    phoneNumber({
      // 发送验证码
      sendOTP: async ({ phoneNumber: phone, code }, request) => {
        // 开发环境：打印验证码到控制台
        if (process.env.NODE_ENV === "development") {
          console.log(`[DEV] 验证码已发送到 ${phone}: ${code}`);
          return;
        }

        // TODO: 生产环境集成短信服务商
        // 例如：阿里云短信、腾讯云短信等
        // await sendSMS(phone, `您的验证码是：${code}，5分钟内有效`);

        throw new Error("短信服务暂未配置，请联系管理员");
      },
      // 验证码有效期（默认 5 分钟）
      otpExpiry: 60 * 5,
      // 验证码长度
      otpLength: 6,
      // 验证后自动创建用户
      signUpOnVerification: {
        getTempEmail: (phoneNumber) => `${phoneNumber}@temp.helishixiong.com`,
        getTempName: (phoneNumber) => `用户${phoneNumber.slice(-4)}`,
      },
    }),
  ],

  // Session 配置
  session: {
    expiresIn: 60 * 60 * 24 * 7, // 7 天
    updateAge: 60 * 60 * 24, // 每天更新一次
    cookieCache: {
      enabled: true,
      maxAge: 60 * 5, // 5 分钟缓存
    },
  },

  // 用户配置
  user: {
    additionalFields: {
      phoneNumber: {
        type: "string",
        required: false,
        unique: true,
      },
      phoneNumberVerified: {
        type: "boolean",
        required: false,
        defaultValue: false,
      },
    },
  },

  // 高级配置
  advanced: {
    generateId: "cuid", // 使用 CUID 生成 ID
  },

  // 安全配置
  rateLimit: {
    enabled: true,
    window: 60, // 60 秒窗口
    max: 5, // 最多 5 次请求
  },
});

// 导出类型
export type Auth = typeof auth;
