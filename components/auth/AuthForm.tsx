'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Loader2, Phone, KeyRound, ShieldCheck } from 'lucide-react';
import { authClient } from '@/lib/auth-client';

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
      const result = await authClient.phoneNumber.sendOtp({
        phoneNumber: phone,
      });

      if (result.error) {
        setError(result.error.message || '发送验证码失败');
        return;
      }

      setStep('code');
    } catch (err) {
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

      onSuccess();
      router.push('/projects');
    } catch (err) {
      setError('登录失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full">
      {step === 'phone' ? (
        <div className="space-y-5">
          {/* Phone Input */}
          <div className="relative">
            <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="tel"
              placeholder="请输入手机号"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              maxLength={11}
              className="input pl-12 h-12"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-destructive text-sm px-1">{error}</p>
          )}

          {/* Submit */}
          <Button
            className="btn-primary w-full h-12"
            onClick={handleSendCode}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              <>
                <ShieldCheck className="h-4 w-4 mr-2" />
                获取验证码
              </>
            )}
          </Button>
        </div>
      ) : (
        <div className="space-y-5">
          {/* Code Input */}
          <div className="relative">
            <KeyRound className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="请输入6位验证码"
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              maxLength={6}
              className="input pl-12 h-12"
            />
          </div>

          {/* Error */}
          {error && (
            <p className="text-destructive text-sm px-1">{error}</p>
          )}

          {/* Submit */}
          <Button
            className="btn-primary w-full h-12"
            onClick={handleVerify}
            disabled={loading}
          >
            {loading ? (
              <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
              '登录'
            )}
          </Button>

          {/* Back */}
          <Button
            variant="ghost"
            className="w-full h-11"
            onClick={() => {
              setStep('phone');
              setCode('');
              setError('');
            }}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            返回修改手机号
          </Button>
        </div>
      )}

      {/* Dev Hint */}
      <div className="mt-6 p-3 rounded-xl bg-muted/50 border border-border text-center">
        <p className="text-xs text-muted-foreground">
          开发阶段验证码查看控制台输出
        </p>
      </div>
    </div>
  );
}
