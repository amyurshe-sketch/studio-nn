import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useI18n } from './i18n';

function RegisterPage() {
  const { t } = useI18n();
  const [formData, setFormData] = useState({
    name: '',
    age: '',
    email: '',
    password: '',
    confirmPassword: '',
    gender: '',
    code: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [step, setStep] = useState('initiate'); // 'initiate' or 'verify'
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const validateEmail = (email) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    return emailRegex.test(email);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    // Валидация
    if (formData.password !== formData.confirmPassword) {
      setError(t('register.error.mismatch'));
      setLoading(false);
      return;
    }

    if (formData.password.length < 3) {
      setError(t('register.error.short'));
      setLoading(false);
      return;
    }

    const ageNum = Number(formData.age);
    if (!Number.isFinite(ageNum) || ageNum < 1 || ageNum > 120) {
      setError(t('register.error.age'));
      setLoading(false);
      return;
    }

    if (!formData.gender) {
      setError(t('register.error.gender'));
      setLoading(false);
      return;
    }

    // Валидация email
    if (!validateEmail(formData.email)) {
      setError(t('register.error.email'));
      setLoading(false);
      return;
    }

    try {
      // Инициируем регистрацию (отправляется код на тестовый email на сервере)
      const response = await fetch('http://localhost:8000/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: formData.name,
          age: parseInt(formData.age),
          email: formData.email,
          password: formData.password,
          gender: formData.gender
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('register.submit.register'));
      }

      // Если успешно — показываем поле для ввода кода подтверждения
      setStep('verify');
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!formData.code || formData.code.length !== 6) {
      setError(t('register.code.label'));
      setLoading(false);
      return;
    }

    try {
      const response = await fetch('http://localhost:8000/verify-email', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        // Accept Set-Cookie from cross-origin backend
        credentials: 'include',
        body: JSON.stringify({
          email: formData.email,
          code: formData.code
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.detail || t('register.submit.verify'));
      }

      // Успешная верификация — cookies уже установлены; перезагрузим на /users,
      // чтобы AuthProvider выполнил /me и подтянул сессию
      if (typeof window !== 'undefined') {
        window.location.assign('/users');
      } else {
        navigate('/users');
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="register-page">
      <div className="auth-container">
        <div className="auth-card">
          <Link to="/" className="back-button">{t('login.back')}</Link>
          <h1 className="page-title">{t('register.title')}</h1>
          <p className="page-description">{t('register.subtitle')}</p>

          <form onSubmit={step === 'initiate' ? handleSubmit : handleVerify} className="auth-form">
            <div className="form-group">
              <label htmlFor="name">{t('register.name')}</label>
              <input
                type="text"
                id="name"
                name="name"
                value={formData.name}
                onChange={handleChange}
                required
                placeholder={t('register.name.placeholder')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="age">{t('register.age')}</label>
              <input
                type="number"
                id="age"
                name="age"
                value={formData.age}
                onChange={handleChange}
                required
                min="1"
                max="120"
                placeholder={t('register.age.placeholder')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="gender">{t('register.gender')} <span className="required-mark">*</span></label>
              <select
                id="gender"
                name="gender"
                value={formData.gender}
                onChange={handleChange}
                required
                className="form-control"
              >
                <option value="">{t('register.gender.choose')}</option>
                <option value="мужской">{t('register.gender.male')}</option>
                <option value="женский">{t('register.gender.female')}</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="email">{t('register.email')}</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder={t('register.email.placeholder')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('register.password')}</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                minLength={3}
                placeholder={t('register.password.placeholder')}
              />
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">{t('register.password.confirm')}</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                placeholder={t('register.password.confirm.placeholder')}
              />
            </div>

            {step === 'verify' && (
              <div className="form-group">
                <label htmlFor="code">{t('register.code.label')}</label>
                <input
                  type="text"
                  id="code"
                  name="code"
                  value={formData.code || ''}
                  onChange={handleChange}
                  required
                  placeholder={t('register.code.placeholder')}
                  maxLength={6}
                />
                <div className="form-hint">{t('register.code.hint')}</div>
              </div>
            )}

            {error && <div className="error-message">{error}</div>}

            <button 
              type="submit" 
              disabled={loading}
              className="submit-button"
            >
              {loading ? (step === 'initiate' ? t('register.submitting.register') : t('register.submitting.verify')) : (step === 'initiate' ? t('register.submit.register') : t('register.submit.verify'))}
            </button>

            <div className="auth-link">
              {t('register.link.have')} <Link to="/login">{t('register.link.login')}</Link>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

export default RegisterPage;
