import RegisterForm from "@/src/features/auth/components/RegisterForm";

export default function RegisterPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-4">
      <div className="w-full max-w-md space-y-6">
        <h1 className="text-2xl font-bold text-center">Create an Account</h1>
        <RegisterForm />
      </div>
    </main>
  );
}