'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowLeft, Loader2 } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSendCode = async () => {
    if (!/^1[3-9]\d{9}$/.test(phone)) {
      setError('请输入正确的手机号');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/send-code', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '发送验证码失败');
        return;
      }

      setStep('code');
    } catch {
      setError('发送验证码失败');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async () => {
    if (!code || code.length !== 6) {
      setError('请输入6位验证码');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const res = await fetch('/api/auth/verify', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ phone, code }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || '登录失败');
        return;
      }

      // 登录成功，跳转到首页
      router.push('/');
    } catch {
      setError('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4">
      {/* 背景 */}
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted" />
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/8 rounded-full blur-3xl" />
        <div className="absolute bottom-1/4 right-1/4 w-80 h-80 bg-primary/6 rounded-full blur-3xl" />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            Kami Slides
          </div>
          <h1 className="text-2xl font-bold">登录</h1>
          <p className="text-muted-foreground text-sm mt-1">
            使用手机号验证码登录
          </p>
        </div>

        {/* 表单 */}
        <div className="glass-card p-6">
          {step === 'phone' ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <Input
                    id="phone"
                    type="tel"
                    placeholder="请输入手机号"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    maxLength={11}
                  />
                </div>

                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}

                <Button
                  className="w-full btn-primary-glow"
                  onClick={handleSendCode}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    '获取验证码'
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <Input
                    id="code"
                    type="text"
                    placeholder="请输入6位验证码"
                    value={code}
                    onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    maxLength={6}
                  />
                  <p className="text-xs text-muted-foreground">
                    验证码已发送至 {phone}
                  </p>
                </div>

                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}

                <Button
                  className="w-full btn-primary-glow"
                  onClick={handleVerify}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    '登录'
                  )}
                </Button>

                <Button
                  variant="ghost"
                  className="w-full"
                  onClick={() => {
                    setStep('phone');
                    setCode('');
                    setError('');
                  }}
                >
                  <ArrowLeft className="h-4 w-4 mr-1" />
                  返回修改手机号
                </Button>
              </div>
            </>
          )}
        </div>

        {/* 提示 */}
        <p className="text-center text-xs text-muted-foreground mt-4">
          开发阶段验证码固定为：123456
        </p>
      </div>
    </div>
  );
}
