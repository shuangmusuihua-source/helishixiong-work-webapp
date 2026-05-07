'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, ArrowLeft, Loader2, Phone, KeyRound, ShieldCheck } from 'lucide-react';
import { ThemeToggle } from '@/components/theme/ThemeToggle';
import { authClient } from '@/lib/auth-client';

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
      const result = await authClient.phoneNumber.sendOtp({
        phoneNumber: phone,
      });

      if (result.error) {
        setError(result.error.message || '发送验证码失败');
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
      const result = await authClient.phoneNumber.verify({
        phoneNumber: phone,
        code,
      });

      if (result.error) {
        setError(result.error.message || '登录失败');
        return;
      }

      router.push('/projects');
    } catch {
      setError('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-4">
      {/* 背景 */}
      <div className="fixed inset-0 -z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-background via-background to-muted/30" />
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[400px] bg-gradient-to-r from-primary/15 to-accent/10 rounded-full blur-[100px]" />
        <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-primary/5 rounded-full blur-[80px]" />
      </div>

      {/* 主题切换 */}
      <div className="fixed top-4 right-4">
        <ThemeToggle />
      </div>

      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-primary/10 to-accent/10 border border-primary/20 text-primary text-sm font-medium mb-4">
            <Sparkles className="h-4 w-4" />
            河狸师兄
          </div>
          <h1 className="text-2xl font-bold">登录</h1>
          <p className="text-muted-foreground text-sm mt-1">
            使用手机号验证码登录
          </p>
        </div>

        {/* 表单 */}
        <div className="p-6 rounded-2xl border border-border/50 bg-card/80 backdrop-blur-xl shadow-xl">
          {step === 'phone' ? (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">手机号</Label>
                  <div className="relative">
                    <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="请输入手机号"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      maxLength={11}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}

                <Button
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
                  onClick={handleSendCode}
                  disabled={loading}
                >
                  {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <>
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      获取验证码
                    </>
                  )}
                </Button>
              </div>
            </>
          ) : (
            <>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="code">验证码</Label>
                  <div className="relative">
                    <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                    <Input
                      id="code"
                      type="text"
                      placeholder="请输入6位验证码"
                      value={code}
                      onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                      maxLength={6}
                      className="pl-10 h-11 rounded-xl"
                    />
                  </div>
                  <p className="text-xs text-muted-foreground">
                    验证码已发送至 {phone}
                  </p>
                </div>

                {error && (
                  <p className="text-destructive text-sm">{error}</p>
                )}

                <Button
                  className="w-full h-11 rounded-xl bg-gradient-to-r from-primary to-blue-500 hover:from-primary/90 hover:to-blue-500/90 shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30 transition-all"
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
                  className="w-full h-10 rounded-xl"
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
          开发阶段验证码查看控制台输出
        </p>
      </div>
    </div>
  );
}