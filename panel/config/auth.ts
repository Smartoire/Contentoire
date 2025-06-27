export const authConfig = {
  providers: {
    google: process.env.GOOGLE_CLIENT_ID !== undefined,
    facebook: process.env.FACEBOOK_CLIENT_ID !== undefined,
    apple: process.env.APPLE_CLIENT_ID !== undefined,
    twitter: process.env.TWITTER_CLIENT_ID !== undefined,
    linkedin: process.env.LINKEDIN_CLIENT_ID !== undefined,
  },
  defaultRedirect: "/",
  sessionMaxAge: 30 * 24 * 60 * 60, // 30 days
};
