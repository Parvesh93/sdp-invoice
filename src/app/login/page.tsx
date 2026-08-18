// "use client";

// import {
//   FormEvent,
//   useState,
// } from "react";

// import { useRouter } from "next/navigation";

// export default function LoginPage() {
//   const router = useRouter();

//   const [
//     email,
//     setEmail,
//   ] = useState("");

//   const [
//     password,
//     setPassword,
//   ] = useState("");

//   const [
//     error,
//     setError,
//   ] = useState("");

//   const [
//     loading,
//     setLoading,
//   ] = useState(false);

//   async function handleSubmit(
//     event: FormEvent<HTMLFormElement>
//   ) {
//     event.preventDefault();

//     setLoading(true);
//     setError("");

//     try {
//       const response =
//         await fetch(
//           "/api/auth/login",
//           {
//             method: "POST",

//             headers: {
//               "Content-Type":
//                 "application/json",
//             },

//             body: JSON.stringify({
//               email:
//                 email
//                   .trim()
//                   .toLowerCase(),

//               password,
//             }),
//           }
//         );

//       const contentType =
//         response.headers.get(
//           "content-type"
//         );

//       if (
//         !contentType?.includes(
//           "application/json"
//         )
//       ) {
//         throw new Error(
//           `Login API returned ${response.status}.`
//         );
//       }

//       const result =
//         await response.json();

//       if (!response.ok) {
//         setError(
//           result.message ||
//             "Unable to login."
//         );

//         return;
//       }

//       router.push(
//         "/dashboard"
//       );

//       router.refresh();
//     } catch (error) {
//       console.error(
//         "LOGIN ERROR:",
//         error
//       );

//       setError(
//         error instanceof Error
//           ? error.message
//           : "Something went wrong."
//       );
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-slate-100 px-4">
//       <div className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-10 shadow-sm">
//         <h1 className="text-3xl font-bold text-slate-900">
//           SDP Machines
//         </h1>

//         <p className="mt-2 text-slate-500">
//           Sign in to quotation management
//         </p>

//         {error && (
//           <div className="mt-6 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
//             {error}
//           </div>
//         )}

//         <form
//           onSubmit={
//             handleSubmit
//           }
//           className="mt-8 space-y-5"
//         >
//           <div>
//             <label
//               htmlFor="email"
//               className="mb-2 block font-medium text-slate-700"
//             >
//               Email
//             </label>

//             <input
//               id="email"
//               type="email"
//               value={email}
//               onChange={(
//                 event
//               ) =>
//                 setEmail(
//                   event.target.value
//                 )
//               }
//               placeholder="admin@sdp.local"
//               autoComplete="email"
//               required
//               className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
//             />
//           </div>

//           <div>
//             <label
//               htmlFor="password"
//               className="mb-2 block font-medium text-slate-700"
//             >
//               Password
//             </label>

//             <input
//               id="password"
//               type="password"
//               value={
//                 password
//               }
//               onChange={(
//                 event
//               ) =>
//                 setPassword(
//                   event.target.value
//                 )
//               }
//               autoComplete="current-password"
//               required
//               className="w-full rounded-lg border border-slate-300 px-4 py-3 outline-none transition focus:border-slate-900 focus:ring-1 focus:ring-slate-900"
//             />
//           </div>

//           <button
//             type="submit"
//             disabled={
//               loading
//             }
//             className="w-full rounded-lg bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
//           >
//             {loading
//               ? "Signing in..."
//               : "Login"}
//           </button>
//         </form>
//       </div>
//     </div>
//   );
// }


"use client";

import {
  FormEvent,
  useState,
} from "react";

import {
  Eye,
  EyeOff,
  LockKeyhole,
  Mail,
} from "lucide-react";

import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router =
    useRouter();

  const [
    email,
    setEmail,
  ] = useState("");

  const [
    password,
    setPassword,
  ] = useState("");

  const [
    showPassword,
    setShowPassword,
  ] = useState(false);

  const [
    error,
    setError,
  ] = useState("");

  const [
    loading,
    setLoading,
  ] = useState(false);

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response =
        await fetch(
          "/api/auth/login",
          {
            method:
              "POST",

            headers: {
              "Content-Type":
                "application/json",
            },

            body:
              JSON.stringify({
                email:
                  email
                    .trim()
                    .toLowerCase(),

                password,
              }),
          }
        );

      const contentType =
        response.headers.get(
          "content-type"
        );

      if (
        !contentType?.includes(
          "application/json"
        )
      ) {
        throw new Error(
          `Login API returned ${response.status}.`
        );
      }

      const result =
        await response.json();

      if (!response.ok) {
        setError(
          result.message ||
            "Unable to login."
        );

        return;
      }

      router.push(
        "/dashboard"
      );

      router.refresh();
    } catch (error) {
      console.error(
        "LOGIN ERROR:",
        error
      );

      setError(
        error instanceof
          Error
          ? error.message
          : "Something went wrong."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-950">
      <div className="grid min-h-screen lg:grid-cols-[1.05fr_0.95fr]">
        {/* =================================================
            LEFT BRAND PANEL
        ================================================= */}

        <section className="relative hidden overflow-hidden lg:flex lg:flex-col lg:justify-between">
          {/* Background accents */}

          <div className="absolute inset-0">
            <div className="absolute -left-24 -top-24 h-80 w-80 rounded-full bg-white/5 blur-3xl" />

            <div className="absolute bottom-0 right-0 h-96 w-96 rounded-full bg-slate-700/30 blur-3xl" />

            <div className="absolute inset-0 bg-[linear-gradient(to_right,rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(to_bottom,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px]" />
          </div>

          <div className="relative z-10 flex h-full flex-col justify-between p-14 xl:p-20">
            {/* Brand */}

            <div>
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-2xl border border-white/10 bg-white/10 text-lg font-bold text-white shadow-xl backdrop-blur">
                  SDP
                </div>

                <div>
                  <p className="text-lg font-semibold text-white">
                    SDP Machines
                  </p>

                  <p className="text-xs uppercase tracking-[0.22em] text-slate-400">
                    Management System
                  </p>
                </div>
              </div>
            </div>

            {/* Main copy */}

            <div className="max-w-xl">
              <div className="mb-6 inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.18em] text-slate-300 backdrop-blur">
                Quotation & Order Management
              </div>

              <h1 className="text-5xl font-semibold leading-[1.08] tracking-tight text-white xl:text-6xl">
                Manage every
                <span className="block text-slate-300">
                  quotation with clarity.
                </span>
              </h1>

              <p className="mt-6 max-w-lg text-base leading-7 text-slate-400">
                Create quotations, manage customers and products,
                generate professional PDFs, and keep your sales
                workflow organised from one place.
              </p>
            </div>

            {/* Footer */}

            <div className="text-sm text-slate-500">
              Secure internal access for SDP Machines
            </div>
          </div>
        </section>

        {/* =================================================
            LOGIN PANEL
        ================================================= */}

        <section className="relative flex min-h-screen items-center justify-center bg-slate-50 px-5 py-10 sm:px-8">
          {/* Mobile decoration */}

          <div className="absolute inset-x-0 top-0 h-40 bg-gradient-to-b from-slate-200/70 to-transparent lg:hidden" />

          <div className="relative z-10 w-full max-w-md">
            {/* Mobile brand */}

            <div className="mb-8 flex items-center justify-center gap-3 lg:hidden">
              <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-slate-950 text-sm font-bold text-white">
                SDP
              </div>

              <div>
                <p className="font-semibold text-slate-950">
                  SDP Machines
                </p>

                <p className="text-xs text-slate-500">
                  Quotation Management
                </p>
              </div>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-white p-6 shadow-[0_24px_80px_-32px_rgba(15,23,42,0.35)] sm:p-9">
              {/* Heading */}

              <div>
                <p className="text-sm font-medium text-slate-500">
                  Welcome back
                </p>

                <h2 className="mt-2 text-3xl font-bold tracking-tight text-slate-950">
                  Sign in to your account
                </h2>

                <p className="mt-3 text-sm leading-6 text-slate-500">
                  Enter your credentials to access the SDP Machines
                  administration system.
                </p>
              </div>

              {/* Error */}

              {error && (
                <div
                  role="alert"
                  className="mt-6 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm leading-6 text-red-700"
                >
                  {error}
                </div>
              )}

              {/* Form */}

              <form
                onSubmit={
                  handleSubmit
                }
                className="mt-8 space-y-5"
              >
                {/* Email */}

                <div>
                  <label
                    htmlFor="email"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Email address
                  </label>

                  <div className="relative">
                    <Mail
                      size={18}
                      strokeWidth={1.8}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="email"
                      type="email"
                      value={email}
                      onChange={(
                        event
                      ) =>
                        setEmail(
                          event.target.value
                        )
                      }
                      placeholder="you@example.com"
                      autoComplete="email"
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-4 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />
                  </div>
                </div>

                {/* Password */}

                <div>
                  <label
                    htmlFor="password"
                    className="mb-2 block text-sm font-semibold text-slate-700"
                  >
                    Password
                  </label>

                  <div className="relative">
                    <LockKeyhole
                      size={18}
                      strokeWidth={1.8}
                      className="pointer-events-none absolute left-4 top-1/2 -translate-y-1/2 text-slate-400"
                    />

                    <input
                      id="password"
                      type={
                        showPassword
                          ? "text"
                          : "password"
                      }
                      value={
                        password
                      }
                      onChange={(
                        event
                      ) =>
                        setPassword(
                          event.target.value
                        )
                      }
                      autoComplete="current-password"
                      required
                      disabled={loading}
                      className="w-full rounded-xl border border-slate-300 bg-white py-3.5 pl-11 pr-12 text-sm text-slate-900 outline-none transition focus:border-slate-950 focus:ring-4 focus:ring-slate-950/5 disabled:cursor-not-allowed disabled:bg-slate-50"
                    />

                    <button
                      type="button"
                      onClick={() =>
                        setShowPassword(
                          (
                            current
                          ) =>
                            !current
                        )
                      }
                      disabled={loading}
                      aria-label={
                        showPassword
                          ? "Hide password"
                          : "Show password"
                      }
                      className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 transition hover:text-slate-700 disabled:cursor-not-allowed"
                    >
                      {showPassword ? (
                        <EyeOff
                          size={18}
                          strokeWidth={1.8}
                        />
                      ) : (
                        <Eye
                          size={18}
                          strokeWidth={1.8}
                        />
                      )}
                    </button>
                  </div>
                </div>

                {/* Submit */}

                <button
                  type="submit"
                  disabled={
                    loading
                  }
                  className="group flex w-full items-center justify-center rounded-xl bg-slate-950 px-4 py-3.5 text-sm font-semibold text-white shadow-sm transition hover:bg-slate-800 focus:outline-none focus:ring-4 focus:ring-slate-950/10 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {loading ? (
                    <span className="flex items-center gap-2">
                      <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />

                      Signing in...
                    </span>
                  ) : (
                    "Sign in"
                  )}
                </button>
              </form>

              {/* Bottom note */}

              <div className="mt-8 border-t border-slate-100 pt-5 text-center">
                <p className="text-xs leading-5 text-slate-400">
                  Authorised users only. Your session is securely
                  protected.
                </p>
              </div>
            </div>

            <p className="mt-6 text-center text-xs text-slate-400">
              © {new Date().getFullYear()} SDP Machines
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}