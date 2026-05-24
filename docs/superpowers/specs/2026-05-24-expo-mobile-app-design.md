# Expo Mobile App — Design Spec

## Architecture
- `mobile/` Expo SDK 53 + Expo Router + NativeWind v4
- `shared/` package with types, i18n, utils shared between frontend/ and mobile/
- Supabase JS SDK for auth + data, worker API for /analyze, Stripe RN for payments
- Expo Push API for native restock notifications

## Screens
1. Auth (login, register, forgot-password) — Supabase email/password + Google OAuth
2. Dashboard (tabs) — watch list with live stock status
3. Add Watch — paste URL → auto-detect metadata → select size → create alert
4. Settings — account, subscription management, language toggle, logout

## Tech stack
- expo-router (file-based routing), NativeWind v4, @supabase/supabase-js
- expo-secure-store for sessions, expo-notifications for push
- @stripe/stripe-react-native for subscriptions
- motion/react-native for animations
