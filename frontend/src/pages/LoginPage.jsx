import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useDispatch } from 'react-redux';
import { useFormik } from 'formik';
import * as Yup from 'yup';
import toast from 'react-hot-toast';
import { setCredentials } from '../redux/slices/authSlice';
import authService from '../services/authService';
import { PenTool, Lock, User, ArrowRight, ShieldCheck } from 'lucide-react';

const LoginSchema = Yup.object().shape({
  username: Yup.string().required('Username is required'),
  password: Yup.string().required('Password is required'),
});

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const [submitting, setSubmitting] = useState(false);

  const from = location.state?.from?.pathname || '/';

  const formik = useFormik({
    initialValues: {
      username: '',
      password: '',
    },
    validationSchema: LoginSchema,
    onSubmit: async (values) => {
      setSubmitting(true);
      try {
        const response = await authService.login(values);
        if (response.success) {
          dispatch(
            setCredentials({
              token: response.data.token,
              user: response.data.user,
            })
          );
          toast.success(`Welcome back, ${response.data.user.username}!`);
          navigate(from, { replace: true });
        } else {
          toast.error(response.message || 'Login failed');
        }
      } catch (err) {
        // Handled in axios interceptor or fallback
        const msg = err.response?.data?.message || 'Invalid username or password';
        toast.error(msg);
      } finally {
        setSubmitting(false);
      }
    },
  });

  const handleQuickLogin = (user, pass) => {
    formik.setValues({
      username: user,
      password: pass,
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-brand-950 to-slate-900 flex flex-col justify-center items-center p-4 sm:p-6">
      <div className="max-w-md w-full">
        {/* Brand Card */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-14 h-14 rounded-2xl bg-brand-600 text-white shadow-xl shadow-brand-500/30 mb-4">
            <PenTool className="w-7 h-7" />
          </div>
          <h1 className="text-2xl font-bold text-white tracking-tight">
            Ball Pen Production Tracking System
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Manufacturing Execution System (MES) • Sign in to your workstation
          </p>
        </div>

        {/* Login Form Box */}
        <div className="bg-white rounded-2xl shadow-2xl p-6 sm:p-8 border border-slate-100">
          <form onSubmit={formik.handleSubmit} className="space-y-4">
            {/* Username Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Username or Employee ID
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <User className="w-4 h-4" />
                </div>
                <input
                  id="username"
                  name="username"
                  type="text"
                  placeholder="e.g. admin or operator"
                  value={formik.values.username}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${formik.touched.username && formik.errors.username
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:border-brand-500 bg-slate-50/50'
                    }`}
                />
              </div>
              {formik.touched.username && formik.errors.username && (
                <div className="text-xs text-rose-500 mt-1">{formik.errors.username}</div>
              )}
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase tracking-wider mb-1.5">
                Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-400">
                  <Lock className="w-4 h-4" />
                </div>
                <input
                  id="password"
                  name="password"
                  type="password"
                  placeholder="••••••••"
                  value={formik.values.password}
                  onChange={formik.handleChange}
                  onBlur={formik.handleBlur}
                  className={`w-full pl-10 pr-4 py-2.5 rounded-xl border text-sm focus:outline-none transition-colors ${formik.touched.password && formik.errors.password
                      ? 'border-rose-300 focus:border-rose-500 bg-rose-50/20'
                      : 'border-slate-200 focus:border-brand-500 bg-slate-50/50'
                    }`}
                />
              </div>
              {formik.touched.password && formik.errors.password && (
                <div className="text-xs text-rose-500 mt-1">{formik.errors.password}</div>
              )}
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full mt-2 py-3 px-4 rounded-xl bg-brand-600 hover:bg-brand-700 active:bg-brand-800 text-white font-semibold text-sm shadow-lg shadow-brand-600/30 flex items-center justify-center gap-2 transition-colors disabled:opacity-50"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In to Plant Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Quick Demo Credentials (Viva & Testing Helper) */}
          <div className="mt-6 pt-5 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-500 mb-2.5">
              <ShieldCheck className="w-4 h-4 text-brand-600" />
              <span>Demo Quick-Fill Accounts:</span>
            </div>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => handleQuickLogin('admin', 'admin123')}
                className="px-2 py-1.5 rounded-lg bg-purple-50 hover:bg-purple-100 text-purple-700 text-xs font-medium border border-purple-200 text-center transition-colors"
              >
                Admin
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('supervisor', 'supervisor123')}
                className="px-2 py-1.5 rounded-lg bg-amber-50 hover:bg-amber-100 text-amber-700 text-xs font-medium border border-amber-200 text-center transition-colors"
              >
                Supervisor
              </button>
              <button
                type="button"
                onClick={() => handleQuickLogin('operator', 'operator123')}
                className="px-2 py-1.5 rounded-lg bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-medium border border-brand-200 text-center transition-colors"
              >
                Operator
              </button>
            </div>
          </div>
        </div>

        {/* Footer Note */}
        <p className="text-center text-xs text-slate-500 mt-6">
          • Spring Boot 3 + React MES Architecture
        </p>
      </div>
    </div>
  );
}

export default LoginPage;
