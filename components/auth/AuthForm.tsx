'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Sparkles, ArrowLeft, Loader2, Phone, KeyRound } from 'lucide-react';

interface AuthFormProps {
  onSuccess: () => void;
}

export function AuthForm({ onSuccess }: AuthFormProps) {
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

      onSuccess();
      router.push('/projects');
    } catch {
      setError('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="glass-card p-6 w-full max-w-sm">
      <div className="text-center mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/10 text-primary text-sm font-medium mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Kami Slides
        </div>
        <h2 className="text-xl font-semibold">
          {step === 'phone' ? '登录 / 注册' : '输入验证码'}
        </h2>
        <p className="text-sm text-muted-foreground mt-1">
          {step === 'phone' ? '使用手机号快速登录' : `验证码已发送至 ${phone}`}
        </p>
      </div>

      {step === 'phone' ? (
        <div className="space-y-4">
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
              className="pl-10"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

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
      ) : (
        <div className="space-y-4">
          <div className="relative">
            <KeyRound className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              type="text"
              placeholder="请输入6位验证码"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="pl-10"
            />
          </div>

          {error && <p className="text-destructive text-sm">{error}</p>}

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
      )}

      <p className="text-center text-xs text-muted-foreground mt-4">
        开发阶段验证码：123456
      </p>
    </div>
  );
}