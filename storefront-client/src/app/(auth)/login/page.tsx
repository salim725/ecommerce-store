import LoginForm from "@/src/features/auth/components/LoginForm";

export default function LoginPage() {
    return (
      <main className="min-h-screen flex items-center justify-center p-4">
        <div className="w-full max-w-md space-y-6">
          <h1 className="text-2xl font-bold text-center">Welcome Back</h1>
          <LoginForm />
        </div>
      </main>
    );
  }
  //These are thin page wrappers — they just center the form on screen. 
  // All logic lives in the form component.