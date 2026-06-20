import React, { useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import styles from "./SettingsPage.module.css";
import toast from "react-hot-toast";
import { PATHS } from "../../routs/paths";
import { usersApi } from "../../api/users.service";

import {
  FaUserCircle,
  FaCamera,
  FaTrash,
  FaSave,
  FaUndo,
  FaEnvelope,
  FaPhone,
  FaMapMarkerAlt,
  FaBriefcase,
  FaInfoCircle,
  FaKey,
  FaLink,
  FaChevronRight,
  FaTimes,
  FaExclamationTriangle,
} from "react-icons/fa";

import type { ComponentType } from "react";
import type { IconBaseProps } from "react-icons";

const UserIcon = FaUserCircle as unknown as ComponentType<IconBaseProps>;
const CameraIcon = FaCamera as unknown as ComponentType<IconBaseProps>;
const TrashIcon = FaTrash as unknown as ComponentType<IconBaseProps>;
const SaveIcon = FaSave as unknown as ComponentType<IconBaseProps>;
const UndoIcon = FaUndo as unknown as ComponentType<IconBaseProps>;
const EmailIcon = FaEnvelope as unknown as ComponentType<IconBaseProps>;
const PhoneIcon = FaPhone as unknown as ComponentType<IconBaseProps>;
const MarkerIcon = FaMapMarkerAlt as unknown as ComponentType<IconBaseProps>;
const JobIcon = FaBriefcase as unknown as ComponentType<IconBaseProps>;
const InfoIcon = FaInfoCircle as unknown as ComponentType<IconBaseProps>;
const KeyIcon = FaKey as unknown as ComponentType<IconBaseProps>;
const WebLinkIcon = FaLink as unknown as ComponentType<IconBaseProps>;
const RightIcon = FaChevronRight as unknown as ComponentType<IconBaseProps>;
const CloseIcon = FaTimes as unknown as ComponentType<IconBaseProps>;
const WarningIcon =
  FaExclamationTriangle as unknown as ComponentType<IconBaseProps>;

type Profile = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  location: string;
  role: string;
  website: string;
  bio: string;
  avatarUrl: string;
};

const API_BASE_URL =
  process.env.REACT_APP_API_URL?.replace(/\/$/, "") || "http://localhost:5000";

const safeTrim = (s: string) => s.trim();

const isValidEmail = (s: string) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(s.trim());

const isValidUrl = (s: string) => {
  if (!s.trim()) return true;
  try {
    new URL(s.trim());
    return true;
  } catch {
    return false;
  }
};

const initialsFrom = (firstName: string, lastName: string) => {
  const a = (lastName?.[0] || "").toUpperCase();
  const b = (firstName?.[0] || "").toUpperCase();
  return a + b || "U";
};

const getAvatarSrc = (avatarUrl: string) => {
  if (!avatarUrl) return "";
  if (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://")) {
    return avatarUrl;
  }
  return `${API_BASE_URL}${avatarUrl}`;
};

const mapUserToProfile = (user: any): Profile => ({
  firstName: user.firstName || "",
  lastName: user.lastName || "",
  email: user.email || "",
  phone: user.phone || "",
  location: user.location || "",
  role: user.role || "",
  website: user.website || "",
  bio: user.bio || "",
  avatarUrl: user.avatarUrl || "",
});

const SettingsPage: React.FC = () => {
  const navigate = useNavigate();
  const fileRef = useRef<HTMLInputElement | null>(null);

  const emptyProfile: Profile = useMemo(
    () => ({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
      location: "",
      role: "",
      website: "",
      bio: "",
      avatarUrl: "",
    }),
    [],
  );

  const [saved, setSaved] = useState<Profile>(emptyProfile);
  const [form, setForm] = useState<Profile>(emptyProfile);
  const [loadingProfile, setLoadingProfile] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);

  const [passwordForm, setPasswordForm] = useState({
    currentPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  const [isChangingPassword, setIsChangingPassword] = useState(false);
  const [isPasswordModalOpen, setIsPasswordModalOpen] = useState(false);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      try {
        setLoadingProfile(true);
        const me = await usersApi.me();
        if (cancelled) return;

        const p = mapUserToProfile(me);
        setSaved(p);
        setForm(p);
      } catch (err: any) {
        toast.error(err?.response?.data?.message || "Nu pot încărca profilul");
      } finally {
        if (!cancelled) setLoadingProfile(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, []);

  const hasChanges = useMemo(() => {
    return JSON.stringify(saved) !== JSON.stringify(form);
  }, [saved, form]);

  const onPickAvatar = () => fileRef.current?.click();

  const onAvatarFile = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Te rog selectează o imagine.");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Imaginea e prea mare. Max 10MB.");
      return;
    }

    setIsUploadingAvatar(true);
    try {
      const updated = await usersApi.uploadAvatar(file);
      const next = mapUserToProfile(updated);

      setSaved(next);
      setForm(next);
      toast.success("Poza de profil a fost actualizată.");
    } catch (err: any) {
      toast.error(
        err?.response?.data?.message || "Nu am putut încărca imaginea",
      );
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const removeAvatar = async () => {
    setIsUploadingAvatar(true);
    try {
      const updated = await usersApi.deleteAvatar();
      const next = mapUserToProfile(updated);

      setSaved(next);
      setForm(next);
      toast.success("Poza a fost eliminată.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Nu am putut elimina poza");
    } finally {
      setIsUploadingAvatar(false);
    }
  };

  const resetChanges = () => {
    setForm(saved);
    toast.success("Modificările au fost resetate");
  };

  const validate = (p: Profile) => {
    if (!safeTrim(p.firstName) || !safeTrim(p.lastName)) {
      return {
        ok: false as const,
        message: "Completează numele și prenumele.",
      };
    }

    if (!safeTrim(p.email) || !isValidEmail(p.email)) {
      return { ok: false as const, message: "Email invalid." };
    }

    if (!isValidUrl(p.website)) {
      return { ok: false as const, message: "Website invalid." };
    }

    return { ok: true as const };
  };

  const onSave = async () => {
    const v = validate(form);
    if (!v.ok) {
      toast.error(v.message);
      return;
    }

    setIsSaving(true);
    try {
      const updated = await usersApi.updateMe({
        firstName: form.firstName,
        lastName: form.lastName,
        email: form.email,
        phone: form.phone,
        location: form.location,
        role: form.role,
        website: form.website,
        bio: form.bio,
      });

      const next = mapUserToProfile(updated);

      setSaved(next);
      setForm(next);
      toast.success("Profil actualizat");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Nu am putut salva");
    } finally {
      setIsSaving(false);
    }
  };

  const openPasswordModal = () => {
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
    setIsPasswordModalOpen(true);
  };

  const closePasswordModal = () => {
    if (isChangingPassword) return;

    setIsPasswordModalOpen(false);
    setPasswordForm({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });
  };

  const onChangePassword = async () => {
    const { currentPassword, newPassword, confirmPassword } = passwordForm;

    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error("Completează toate câmpurile pentru parolă.");
      return;
    }

    if (newPassword.length < 6) {
      toast.error("Noua parolă trebuie să aibă minim 6 caractere.");
      return;
    }

    if (newPassword !== confirmPassword) {
      toast.error("Confirmarea parolei nu corespunde.");
      return;
    }

    setIsChangingPassword(true);
    try {
      await usersApi.changePassword({
        currentPassword,
        newPassword,
      });

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setIsPasswordModalOpen(false);
      toast.success("Parola a fost schimbată.");
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Nu am putut schimba parola");
    } finally {
      setIsChangingPassword(false);
    }
  };

  const openDeleteModal = () => {
    setIsDeleteModalOpen(true);
  };

  const closeDeleteModal = () => {
    if (isDeletingAccount) return;
    setIsDeleteModalOpen(false);
  };

  const confirmDeleteAccount = async () => {
    setIsDeletingAccount(true);
    try {
      await usersApi.deleteMe();
      localStorage.removeItem("access_token");
      window.dispatchEvent(new Event("auth-change"));
      toast.success("Contul a fost șters.");
      setIsDeleteModalOpen(false);
      navigate(PATHS.AUTH.LOGIN, { replace: true });
    } catch (err: any) {
      toast.error(err?.response?.data?.message || "Nu am putut șterge contul");
    } finally {
      setIsDeletingAccount(false);
    }
  };

  if (loadingProfile) {
    return (
      <div className={styles.page}>
        <div style={{ padding: 24 }}>Se încarcă profilul...</div>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      <header className={styles.hero}>
        <div className={styles.heroLeft}>
          <div className={styles.heroBadge}>
            <UserIcon size={26} />
          </div>
          <div className={styles.heroText}>
            <h1>
              <span>Setări</span> personale
            </h1>
            <p>
              Actualizează profilul, datele de contact și opțiunile de
              securitate dintr-un singur loc.
            </p>
          </div>
        </div>

        <div className={styles.heroRight}>
          <button
            type="button"
            className={styles.secondaryBtn}
            onClick={resetChanges}
            disabled={!hasChanges || isSaving}
            title="Resetează"
          >
            <UndoIcon /> Reset
          </button>

          <button
            type="button"
            className={styles.primaryBtn}
            onClick={onSave}
            disabled={!hasChanges || isSaving}
            title="Salvează"
          >
            <SaveIcon /> {isSaving ? "Se salvează..." : "Salvează"}
          </button>
        </div>
      </header>

      <div className={styles.layout}>
        <aside className={styles.sideCard}>
          <div className={styles.profileTop}>
            <div className={styles.avatarWrap}>
              {form.avatarUrl ? (
                <img
                  className={styles.avatarImg}
                  src={getAvatarSrc(form.avatarUrl)}
                  alt="Avatar"
                />
              ) : (
                <div className={styles.avatarFallback}>
                  <span className={styles.avatarInitial}>
                    {initialsFrom(form.firstName, form.lastName)}
                  </span>
                </div>
              )}

              <button
                type="button"
                className={styles.avatarEditBtn}
                onClick={onPickAvatar}
                disabled={isUploadingAvatar}
              >
                <CameraIcon />
              </button>
            </div>

            <input
              ref={fileRef}
              type="file"
              accept="image/*"
              className={styles.hiddenFile}
              onChange={(e) => {
                const file = e.target.files?.[0];
                if (file) void onAvatarFile(file);
                e.currentTarget.value = "";
              }}
            />

            <div className={styles.profileMeta}>
              <div className={styles.nameLine}>
                <strong title={`${form.firstName} ${form.lastName}`}>
                  {form.firstName} {form.lastName}
                </strong>
                {hasChanges ? (
                  <span className={styles.unsaved}>nesalvat</span>
                ) : null}
              </div>

              <div className={styles.metaRow}>
                <EmailIcon />
                <span className={styles.metaText}>{form.email}</span>
              </div>

              {form.location ? (
                <div className={styles.metaRow}>
                  <MarkerIcon />
                  <span className={styles.metaText}>{form.location}</span>
                </div>
              ) : null}

              {form.role ? (
                <div className={styles.metaRow}>
                  <JobIcon />
                  <span className={styles.metaText}>{form.role}</span>
                </div>
              ) : null}
            </div>
          </div>

          <div className={styles.profileActions}>
            <button
              type="button"
              className={styles.ghostBtn}
              onClick={onPickAvatar}
              disabled={isSaving || isUploadingAvatar}
            >
              <CameraIcon />{" "}
              {isUploadingAvatar ? "Se încarcă..." : "Schimbă poza"}
            </button>

            <button
              type="button"
              className={styles.dangerGhostBtn}
              onClick={removeAvatar}
              disabled={isSaving || isUploadingAvatar || !form.avatarUrl}
              title={!form.avatarUrl ? "Nu ai poză setată" : "Elimină poza"}
            >
              <TrashIcon /> Elimină
            </button>
          </div>

          <div className={styles.tipBox}>
            <div className={styles.tipIcon}>
              <InfoIcon />
            </div>
            <div>
              <strong>Sfat</strong>
              <p>Folosește o poză clară, cu fundal simplu.</p>
            </div>
          </div>
        </aside>

        <main className={styles.main}>
          <section className={[styles.card, styles.profileCard].join(" ")}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Profil public</h2>
                <p>Numele, rolul și biografia vizibile în aplicație.</p>
              </div>
              <span className={styles.sectionPill}>Profil</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Prenume</label>
                <input
                  value={form.firstName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, firstName: e.target.value }))
                  }
                  placeholder="Ex: Andrei"
                />
              </div>

              <div className={styles.field}>
                <label>Nume</label>
                <input
                  value={form.lastName}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, lastName: e.target.value }))
                  }
                  placeholder="Ex: Ionescu"
                />
              </div>

              <div className={styles.field}>
                <label>Rol(opțional)</label>
                <input
                  value={form.role}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, role: e.target.value }))
                  }
                  placeholder="Ex: Recruiter, HR, Manager"
                />
              </div>

              <div className={styles.field}>
                <label>Locație(opțional)</label>
                <input
                  value={form.location}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, location: e.target.value }))
                  }
                  placeholder="Ex: București, RO"
                />
              </div>

              <div className={[styles.field, styles.full].join(" ")}>
                <label>Bio(opțional)</label>
                <textarea
                  rows={4}
                  value={form.bio}
                  onChange={(e) =>
                    setForm((p) => ({ ...p, bio: e.target.value }))
                  }
                  placeholder="Scrie 2-3 rânduri despre tine..."
                />
              </div>
            </div>
          </section>

          <section className={[styles.card, styles.contactCard].join(" ")}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Detalii de contact</h2>
                <p>Email, telefon și website pentru comunicare clară.</p>
              </div>
              <span className={styles.sectionPill}>Contact</span>
            </div>

            <div className={styles.formGrid}>
              <div className={styles.field}>
                <label>Email</label>
                <div className={styles.inputIcon}>
                  <EmailIcon />
                  <input
                    value={form.email}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, email: e.target.value }))
                    }
                    placeholder="nume@email.com"
                    inputMode="email"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Telefon(opțional)</label>
                <div className={styles.inputIcon}>
                  <PhoneIcon />
                  <input
                    value={form.phone}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, phone: e.target.value }))
                    }
                    placeholder="07xx xxx xxx"
                    inputMode="tel"
                  />
                </div>
              </div>

              <div className={[styles.field, styles.full].join(" ")}>
                <label>Website(opțional)</label>
                <div className={styles.inputIcon}>
                  <WebLinkIcon />
                  <input
                    value={form.website}
                    onChange={(e) =>
                      setForm((p) => ({ ...p, website: e.target.value }))
                    }
                    placeholder="https://..."
                  />
                </div>
              </div>
            </div>
          </section>

          <section className={[styles.card, styles.securityCard].join(" ")}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Securitate cont</h2>
                <p>Gestionează parola contului tău în siguranță.</p>
              </div>
              <span className={styles.sectionPill}>Securitate</span>
            </div>

            <div className={styles.actionList}>
              <button
                type="button"
                className={styles.actionRow}
                onClick={openPasswordModal}
              >
                <span className={styles.actionLeft}>
                  <span className={styles.actionIcon}>
                    <KeyIcon />
                  </span>
                  <span className={styles.actionText}>
                    <strong>Schimbă parola</strong>
                    <small>
                      Actualizează parola contului într-un mod sigur.
                    </small>
                  </span>
                </span>

                <span className={styles.actionRight}>
                  <RightIcon />
                </span>
              </button>
            </div>
          </section>

          <section className={[styles.card, styles.dangerCard].join(" ")}>
            <div className={styles.cardHeader}>
              <div>
                <h2>Zona de risc</h2>
                <p>Acțiuni ireversibile, folosește-le cu grijă.</p>
              </div>
              <span
                className={[styles.sectionPill, styles.dangerPill].join(" ")}
              >
                Pericol
              </span>
            </div>

            <div className={styles.dangerZone}>
              <div className={styles.dangerInfo}>
                <strong>Șterge contul</strong>
                <p>
                  Ștergerea contului este permanentă. Vor dispărea profilul și
                  datele asociate acelui cont.
                </p>
              </div>

              <button
                type="button"
                className={styles.dangerBtn}
                onClick={openDeleteModal}
                disabled={isDeletingAccount}
              >
                <TrashIcon size={11} /> Șterge contul
              </button>
            </div>
          </section>

          <div className={styles.mobileSaveBar}>
            <button
              type="button"
              className={styles.secondaryBtn}
              onClick={resetChanges}
              disabled={!hasChanges || isSaving}
            >
              <UndoIcon /> Reset
            </button>

            <button
              type="button"
              className={styles.primaryBtn}
              onClick={onSave}
              disabled={!hasChanges || isSaving}
            >
              <SaveIcon /> Salvează
            </button>
          </div>
        </main>
      </div>

      {isPasswordModalOpen ? (
        <div className={styles.modalOverlay} onClick={closePasswordModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.modalHeader}>
              <div>
                <h3>Schimbă parola</h3>
                <p>
                  Completează câmpurile de mai jos pentru a actualiza parola.
                </p>
              </div>

              <button
                type="button"
                className={styles.modalCloseBtn}
                onClick={closePasswordModal}
                disabled={isChangingPassword}
              >
                <CloseIcon />
              </button>
            </div>

            <div className={styles.modalBody}>
              <div className={styles.field}>
                <label>Parola curentă</label>
                <div className={styles.inputIcon}>
                  <KeyIcon />
                  <input
                    type="password"
                    value={passwordForm.currentPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        currentPassword: e.target.value,
                      }))
                    }
                    placeholder="Introdu parola curentă"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Parola nouă</label>
                <div className={styles.inputIcon}>
                  <KeyIcon />
                  <input
                    type="password"
                    value={passwordForm.newPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        newPassword: e.target.value,
                      }))
                    }
                    placeholder="Introdu parola nouă"
                  />
                </div>
              </div>

              <div className={styles.field}>
                <label>Confirmă parola nouă</label>
                <div className={styles.inputIcon}>
                  <KeyIcon />
                  <input
                    type="password"
                    value={passwordForm.confirmPassword}
                    onChange={(e) =>
                      setPasswordForm((p) => ({
                        ...p,
                        confirmPassword: e.target.value,
                      }))
                    }
                    placeholder="Reintrodu parola nouă"
                  />
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={closePasswordModal}
                disabled={isChangingPassword}
              >
                Anulează
              </button>

              <button
                type="button"
                className={styles.primaryBtn}
                onClick={onChangePassword}
                disabled={isChangingPassword}
              >
                <KeyIcon />{" "}
                {isChangingPassword ? "Se schimbă..." : "Schimbă parola"}
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {isDeleteModalOpen ? (
        <div className={styles.modalOverlay} onClick={closeDeleteModal}>
          <div
            className={styles.modalCard}
            onClick={(e) => e.stopPropagation()}
          >
            <div className={styles.deleteModalHero}>
              <div className={styles.deleteBadge}>
                <WarningIcon />
                <span>Acțiune ireversibilă</span>
              </div>

              <div className={styles.deleteTopRow}>
                <div className={styles.deleteHeaderCopy}>
                  <h3>Șterge contul</h3>
                  <p>
                    Contul, profilul și datele asociate vor dispărea definitiv
                    din aplicație.
                  </p>
                </div>

                <button
                  type="button"
                  className={styles.modalCloseBtn}
                  onClick={closeDeleteModal}
                  disabled={isDeletingAccount}
                >
                  <CloseIcon />
                </button>
              </div>

              <div className={styles.deleteAccentCard}>
                <div className={styles.deleteAccentIcon}>
                  <TrashIcon />
                </div>
                <div className={styles.deleteAccentText}>
                  <strong>Confirmare finală</strong>
                  <p>
                    După ștergere nu mai poți recupera CV-urile, joburile sau
                    setările contului.
                  </p>
                </div>
              </div>
            </div>

            <div className={styles.modalActions}>
              <button
                type="button"
                className={styles.secondaryBtn}
                onClick={closeDeleteModal}
                disabled={isDeletingAccount}
              >
                Anulează
              </button>

              <button
                type="button"
                className={styles.deleteConfirmBtn}
                onClick={confirmDeleteAccount}
                disabled={isDeletingAccount}
              >
                <TrashIcon />{" "}
                {isDeletingAccount ? "Se șterge..." : "Șterge contul"}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
};

export default SettingsPage;
