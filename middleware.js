// import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
// import { NextResponse } from "next/server";

// const isProtectedRoute = createRouteMatcher([
//   "/onboarding(.*)",
//   "/organization(.*)",
//   "/project(.*)",
//   "/issue(.*)",
//   "/sprint(.*)",
// ]);

// export default clerkMiddleware((auth, req) => {
//   if (!auth().userId && isProtectedRoute(req)) {
//     return auth().redirectToSignIn();
//   }

//   if (
//     auth().userId &&
//     !auth().orgId &&
//     req.nextUrl.pathname !== "/onboarding" &&
//     req.nextUrl.pathname !== "/"
//   ) {
//     return NextResponse.redirect(new URL("/onboarding", req.url));
//   }
// });

// export const config = {
//   matcher: [
//     // Skip Next.js internals and all static files, unless found in search params
//     "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
//     // Always run for API routes
//     "/(api|trpc)(.*)",
//   ],
// };

import { clerkMiddleware, createRouteMatcher } from "@clerk/nextjs/server";
import { NextResponse } from "next/server";

const isProtectedRoute = createRouteMatcher([
  "/onboarding(.*)",
  "/issue(.*)",
  "/sprint(.*)",
]);

export default clerkMiddleware(async (auth, req) => {
  const { userId } = await auth(); // ✅ await here

  if (!userId && isProtectedRoute(req)) {
    return (await auth()).redirectToSignIn(); // also await
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next|[^?]*\\.(?:html?|css|js(?!on)|jpe?g|webp|png|gif|svg|ttf|woff2?|ico|csv|docx?|xlsx?|zip|webmanifest)).*)",
    "/(api|trpc)(.*)",
  ],
};
