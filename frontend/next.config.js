/** @type {import('next').NextConfig} */
const nextConfig = {
    reactStrictMode: true,
    images: {
      domains: [
        'localhost',
        'course-platform-bucket.s3.ap-south-1.amazonaws.com',
        'example.com'
      ]
    }
  }
  
  module.exports = nextConfig