"use client";

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GalleryVerticalEnd } from "lucide-react"

import { Button } from "@workspace/ui/components/button"
import {
    Field,
    FieldDescription,
    FieldGroup,
    FieldLabel,
} from "@workspace/ui/components/field"
import { Input } from "@workspace/ui/components/input"
import { authApi, ApiError } from "@/lib/api"

export default function RegisterPage() {
    const router = useRouter()

    const [identifiant, setIdentifiant] = useState("")
    const [motDePasse, setMotDePasse] = useState("")
    const [confirmMotDePasse, setConfirmMotDePasse] = useState("")
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setError(null)

        if (motDePasse !== confirmMotDePasse) {
            setError("Passwords do not match.")
            return
        }

        setLoading(true)
        try {
            await authApi.register({ identifiant, motDePasse, confirmMotDePasse })
            router.push("/login")
        } catch (err) {
            if (err instanceof ApiError) {
                setError(
                    err.status === 400
                        ? err.message
                        : "Registration failed. Please try again."
                )
            } else {
                setError("An unexpected error occurred.")
            }
        } finally {
            setLoading(false)
        }
    }

    return (
        <div className="flex flex-col gap-6">
            <form onSubmit={handleSubmit}>
                <FieldGroup>
                    <div className="flex flex-col items-center gap-2 text-center">
                        <a
                            href="#"
                            className="flex flex-col items-center gap-2 font-medium"
                        >
                            <div className="flex size-8 items-center justify-center rounded-md">
                                <GalleryVerticalEnd className="size-6" />
                            </div>
                            <span className="sr-only">Acme Inc.</span>
                        </a>
                        <h1 className="text-xl font-bold">Create your account</h1>
                        <FieldDescription>
                            Already have an account?{" "}
                            <a href="/login">Log in</a>
                        </FieldDescription>
                    </div>

                    {error && (
                        <p className="rounded-md bg-red-50 px-3 py-2 text-sm text-red-600">
                            {error}
                        </p>
                    )}

                    <Field>
                        <FieldLabel htmlFor="identifiant">Username</FieldLabel>
                        <Input
                            id="identifiant"
                            type="text"
                            placeholder="john.doe"
                            value={identifiant}
                            onChange={(e) => setIdentifiant(e.target.value)}
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="motDePasse">Password</FieldLabel>
                        <Input
                            id="motDePasse"
                            type="password"
                            placeholder="••••••••"
                            value={motDePasse}
                            onChange={(e) => setMotDePasse(e.target.value)}
                            required
                        />
                    </Field>
                    <Field>
                        <FieldLabel htmlFor="confirmMotDePasse">Confirm Password</FieldLabel>
                        <Input
                            id="confirmMotDePasse"
                            type="password"
                            placeholder="••••••••"
                            value={confirmMotDePasse}
                            onChange={(e) => setConfirmMotDePasse(e.target.value)}
                            required
                        />
                    </Field>
                    <Field>
                        <Button type="submit" disabled={loading}>
                            {loading ? "Creating account…" : "Register"}
                        </Button>
                    </Field>
                </FieldGroup>
            </form>
            <FieldDescription className="px-6 text-center">
                By clicking register, you agree to our{" "}
                <a href="#">Terms of Service</a> and{" "}
                <a href="#">Privacy Policy</a>.
            </FieldDescription>
        </div>
    )
}
