"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, UserPlus } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { useAppState } from "@/components/providers/AppStateProvider";
import { HOSPITALS, ROLES, SERVICES } from "@/lib/mock-data";

const EMPTY = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  hospitalId: "",
  service: "",
  role: "",
};

type Errors = Partial<Record<keyof typeof EMPTY, string>>;

export function RegisterForm() {
  const router = useRouter();
  const { setProfile, signIn } = useAppState();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const update =
    (field: keyof typeof EMPTY) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    };

  /** Validation purement côté client : aucun backend n'est interrogé. */
  const validate = () => {
    const next: Errors = {};
    if (!values.firstName.trim()) next.firstName = "Prénom requis";
    if (!values.lastName.trim()) next.lastName = "Nom requis";
    if (!/^[+0-9 ]{8,}$/.test(values.phone.trim()))
      next.phone = "Numéro invalide";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim()))
      next.email = "Adresse e-mail invalide";
    if (values.password.length < 6) next.password = "6 caractères minimum";
    if (!values.hospitalId) next.hospitalId = "Sélectionnez un hôpital";
    if (!values.service) next.service = "Sélectionnez un service";
    if (!values.role) next.role = "Sélectionnez un rôle";
    return next;
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    signIn();
    setProfile({
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      hospitalId: values.hospitalId,
      service: values.service,
      role: values.role,
    });
    // Redirection immédiate vers l'espace soignant, comme spécifié.
    router.push("/dashboard");
  };

  return (
    <AuthShell
      wide
      title="Créer votre compte soignant"
      subtitle="Quelques informations pour rattacher vos déclarations à votre service. Aucune donnée patient n'est demandée ici."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link
            href="/login"
            className="font-semibold text-hospital hover:underline"
          >
            Se connecter
          </Link>
        </>
      }
    >
      <form onSubmit={onSubmit} noValidate className="space-y-5">
        <div className="grid gap-5 sm:grid-cols-2">
          <Field error={errors.firstName}>
            <Input
              name="firstName"
              label="Prénom"
              autoComplete="given-name"
              value={values.firstName}
              onChange={update("firstName")}
              placeholder="Aline"
            />
          </Field>
          <Field error={errors.lastName}>
            <Input
              name="lastName"
              label="Nom"
              autoComplete="family-name"
              value={values.lastName}
              onChange={update("lastName")}
              placeholder="Dossou"
            />
          </Field>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field error={errors.phone}>
            <Input
              name="phone"
              label="Téléphone"
              type="tel"
              autoComplete="tel"
              value={values.phone}
              onChange={update("phone")}
              placeholder="+229 97 00 00 00"
            />
          </Field>
          <Field error={errors.email}>
            <Input
              name="email"
              label="Adresse e-mail"
              type="email"
              autoComplete="email"
              value={values.email}
              onChange={update("email")}
              placeholder="a.dossou@cnhu.bj"
            />
          </Field>
        </div>

        <Field error={errors.password}>
          <Input
            name="password"
            label="Mot de passe"
            type="password"
            autoComplete="new-password"
            value={values.password}
            onChange={update("password")}
            placeholder="6 caractères minimum"
          />
        </Field>

        <Field error={errors.hospitalId}>
          <Select
            name="hospitalId"
            label="Hôpital de rattachement"
            value={values.hospitalId}
            onChange={update("hospitalId")}
          >
            <option value="">Sélectionner…</option>
            {HOSPITALS.map((hospital) => (
              <option key={hospital.id} value={hospital.id}>
                {hospital.name} — {hospital.city}
              </option>
            ))}
          </Select>
        </Field>

        <div className="grid gap-5 sm:grid-cols-2">
          <Field error={errors.service}>
            <Select
              name="service"
              label="Service"
              value={values.service}
              onChange={update("service")}
            >
              <option value="">Sélectionner…</option>
              {SERVICES.map((service) => (
                <option key={service} value={service}>
                  {service}
                </option>
              ))}
            </Select>
          </Field>
          <Field error={errors.role}>
            <Select
              name="role"
              label="Rôle"
              value={values.role}
              onChange={update("role")}
            >
              <option value="">Sélectionner…</option>
              {ROLES.map((role) => (
                <option key={role} value={role}>
                  {role}
                </option>
              ))}
            </Select>
          </Field>
        </div>

        <Button
          type="submit"
          variant="ink"
          size="lg"
          className="w-full"
          disabled={submitting}
        >
          {submitting ? (
            <LoaderCircle className="size-4.5 animate-spin" />
          ) : (
            <UserPlus className="size-4.5" />
          )}
          {submitting ? "Création du compte…" : "Créer mon compte"}
        </Button>

        <p className="text-center text-xs leading-relaxed text-fg-muted">
          En créant un compte, vous acceptez que vos déclarations soient
          exploitées de manière non punitive, conformément à la charte de
          sécurité des soins de votre établissement.
        </p>
      </form>
    </AuthShell>
  );
}

/** Enveloppe un champ et affiche son message d'erreur de validation. */
function Field({
  error,
  children,
}: {
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      {children}
      {error ? (
        <p className="mt-1.5 text-xs font-semibold text-alert">{error}</p>
      ) : null}
    </div>
  );
}
