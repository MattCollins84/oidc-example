import User from '@/services/User'

export default async function oidcAuth ({ to, next }){
  const user = await User.getCurrentUser()
  return next()
}