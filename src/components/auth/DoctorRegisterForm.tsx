"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { LoaderCircle, Stethoscope } from "lucide-react";
import { AuthShell } from "./AuthShell";
import { Button } from "@/components/ui/Button";
import { Input, Select } from "@/components/ui/Field";
import { useAppState } from "@/components/providers/AppStateProvider";
import { HOSPITALS, SPECIALTIES } from "@/lib/mock-data";

const EMPTY = {
  firstName: "",
  lastName: "",
  phone: "",
  email: "",
  password: "",
  hospitalId: "",
  specialty: "",
};

type Errors = Partial<Record<keyof typeof EMPTY, string>>;

/**
 * Inscription d'un docteur.
 *
 * La spécialité est la donnée décisive : c'est sur elle que la cellule
 * qualité s'appuie pour transmettre une déclaration au bon domaine.
 */
export function DoctorRegisterForm() {
  const router = useRouter();
  const { registerPerson, signInDoctor, people } = useAppState();
  const [values, setValues] = useState(EMPTY);
  const [errors, setErrors] = useState<Errors>({});
  const [submitting, setSubmitting] = useState(false);

  const update =
    (field: keyof typeof EMPTY) =>
    (event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
      setValues((current) => ({ ...current, [field]: event.target.value }));
      setErrors((current) => ({ ...current, [field]: undefined }));
    };

  const validate = () => {
    const next: Errors = {};
    if (!values.firstName.trim()) next.firstName = "Prénom requis";
    if (!values.lastName.trim()) next.lastName = "Nom requis";
    if (!/^[+0-9 ]{8,}$/.test(values.phone.trim()))
      next.phone = "Numéro invalide";
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(values.email.trim())) {
      next.email = "Adresse e-mail invalide";
    } else if (
      people.some(
        (person) =>
          person.email.toLowerCase() === values.email.trim().toLowerCase(),
      )
    ) {
      next.email = "Cette adresse est déjà inscrite sur cet appareil";
    }
    if (values.password.length < 6) next.password = "6 caractères minimum";
    if (!values.hospitalId) next.hospitalId = "Sélectionnez un hôpital";
    if (!values.specialty) next.specialty = "Sélectionnez une spécialité";
    return next;
  };

  const onSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    const found = validate();
    setErrors(found);
    if (Object.keys(found).length > 0) return;

    setSubmitting(true);
    const person = registerPerson({
      kind: "docteur",
      firstName: values.firstName.trim(),
      lastName: values.lastName.trim(),
      phone: values.phone.trim(),
      email: values.email.trim(),
      hospitalId: values.hospitalId,
      specialty: values.specialty,
    });
    signInDoctor(person.id);
    router.push("/docteur");
  };

  return (
    <AuthShell
      wide
      title="Créer votre compte docteur"
      subtitle="Votre spécialité détermine les déclarations qui vous seront transmises par la cellule qualité."
      footer={
        <>
          Déjà inscrit ?{" "}
          <Link
            href="/docteur/connexion"
            className="font-semibold text-hospital hover:underline"
          >
            Se connecter
          </Link>
          <span className="mt-2 block text-xs">
            Vous faites partie du personnel soignant ?{" "}
            <Link
              href="/register"
              className="font-semibold text-hospital hover:underline"
            >
              Créer un compte soignant
            </Link>
          </span>
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
              placeholder="Sylvain"
            />
          </Field>
          <Field error={errors.lastName}>
            <Input
              name="lastName"
              label="Nom"
              autoComplete="family-name"
              value={values.lastName}
              onChange={update("lastName")}
              placeholder="Agbodjan"
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
              placeholder="s.agbodjan@cnhu.bj"
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

        <Field error={errors.specialty}>
          <Select
            name="specialty"
            label="Spécialité"
            value={values.specialty}
            onChange={update("specialty")}
          >
            <option value="">Sélectionner…</option>
            {SPECIALTIES.map((specialty) => (
              <option key={specialty} value={specialty}>
                {specialty}
              </option>
            ))}
          </Select>
        </Field>

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
            <Stethoscope className="size-4.5" />
          )}
          {submitting ? "Création du compte…" : "Créer mon compte docteur"}
        </Button>

        <p className="text-center text-xs leading-relaxed text-fg-muted">
          Votre nom apparaîtra dans l&apos;annuaire de l&apos;établissement,
          consulté par la cellule qualité pour vous transmettre les fiches de
          votre domaine.
        </p>
      </form>
    </AuthShell>
  );
}

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
