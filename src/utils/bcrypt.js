import bcrypt from 'bcrypt'

export const hashPassword = async (password) => {
  const saltGen = await bcrypt.genSalt(10)
  const passHashed = await bcrypt.hash(password, saltGen)
  return passHashed
}
export const checkCompare = async (password, hashedPassword) => {
  const isMatch = await bcrypt.compare(password, hashedPassword)
  return isMatch
}
