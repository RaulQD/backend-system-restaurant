// import mongoose from "mongoose"
// import { exit } from 'node:process'


// export const connectDB = async () => {
//   try {     
//     const conn = await mongoose.connect(process.env.DATABASE_URL)
//     const url = `${conn.connection.host}:${conn.connection.port}/${conn.connection.name}`
//     console.log(`MongoDB connected: ${url}`)
//   } catch (error) {
//     console.error(`Error: ${error.message}`)
//     exit(1)
//   }
// }