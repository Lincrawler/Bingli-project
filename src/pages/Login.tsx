import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import birdMascot from '../assets/bird.jpg';

export default function Login() {
  const navigate = useNavigate();
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');

  const onSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // 简化处理：直接跳转病例页
    navigate('/cases');
  };

  return (
    <div className="min-h-screen bg-primary-light font-sans flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-sm">
        <img src={birdMascot} alt="Mascot" className="w-32 h-32 mx-auto mb-6" />
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800">欢迎回来</h1>
          <p className="text-gray-500">登录以继续您的健康之旅</p>
        </div>
        <form onSubmit={onSubmit} className="bg-white rounded-lg shadow-md p-8 space-y-6">
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">手机号</label>
            <input className="input w-full" value={phone} onChange={(e) => setPhone(e.target.value)} placeholder="请输入手机号" />
          </div>
          <div>
            <label className="text-sm font-bold text-gray-600 block mb-2">密码</label>
            <input className="input w-full" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="请输入密码" />
          </div>
          <button type="submit" className="btn-primary w-full">登录</button>
        </form>
      </div>
    </div>
  );
}