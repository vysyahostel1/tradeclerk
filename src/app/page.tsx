"use client";

import { useEffect, useCallback, useRef } from "react";
import { useStore } from "@/lib/store";
import { Navbar } from "@/components/layout/navbar";
import { Footer } from "@/components/layout/footer";
import { Hero } from "@/components/landing/hero";
import { Categories } from "@/components/landing/categories";
import { FeaturedReports } from "@/components/landing/featured-reports";
import { Pricing } from "@/components/landing/pricing";
import { Testimonials } from "@/components/landing/testimonials";
import { Newsletter } from "@/components/landing/newsletter";
import { Stats } from "@/components/landing/stats";
import { ReportDetail } from "@/components/reports/report-detail";
import { ReportsPage } from "@/components/reports/reports-page";
import { LoginForm } from "@/components/auth/login-form";
import { RegisterForm } from "@/components/auth/register-form";
import { UserDashboard } from "@/components/dashboard/user-dashboard";
import { AdminDashboard } from "@/components/dashboard/admin-dashboard";
import { AnalystDashboard } from "@/components/dashboard/analyst-dashboard";
import { AnalystList } from "@/components/analysts/analyst-list";
import { AnalystProfile } from "@/components/analysts/analyst-profile";
import { ForumPage } from "@/components/forum/forum-page";
import { ForumThread } from "@/components/forum/forum-thread";
import { SearchPage } from "@/components/shared/search-bar";

function parseHash(hash: string): { page: string; params: Record<string, string> } {
  const clean = hash.replace(/^#\/?/, "").replace(/\/$/, "");
  if (!clean) return { page: "home", params: {} };

  const [path, queryString] = clean.split("?");
  const parts = path.split("/");
  const page = parts[0] || "home";
  const params: Record<string, string> = {};

  // Extract params from path segments (key=value pattern or positional)
  if (parts.length > 1) {
    for (let i = 1; i < parts.length; i += 2) {
      if (parts[i] && parts[i + 1]) {
        params[parts[i]] = decodeURIComponent(parts[i + 1]);
      }
    }
  }

  // Extract params from query string
  if (queryString) {
    const searchParams = new URLSearchParams(queryString);
    searchParams.forEach((value, key) => {
      params[key] = value;
    });
  }

  return { page, params };
}

export default function HomePage() {
  const { currentPage, pageParams, navigate, user, isAuthenticated, setUser, setToken } = useStore();
  const initialized = useRef(false);

  // Initialize hash-based routing
  const handleHashChange = useCallback(() => {
    const { page, params } = parseHash(window.location.hash);
    navigate(page, params);
  }, [navigate]);

  // Verify token on mount
  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;

    const token = localStorage.getItem("tc_token");
    if (token && isAuthenticated) {
      fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then((res) => {
          if (res.ok) return res.json();
          throw new Error("Invalid token");
        })
        .then((data) => {
          setUser(data.user);
        })
        .catch(() => {
          // Token is invalid, clear it
          setToken(null);
          setUser(null);
          localStorage.removeItem("tc_token");
          localStorage.removeItem("tc_user");
        });
    }

    // Initial hash parse
    handleHashChange();

    // Listen for hash changes
    window.addEventListener("hashchange", handleHashChange);
    return () => window.removeEventListener("hashchange", handleHashChange);
  }, []);

  const renderPage = () => {
    switch (currentPage) {
      case "home":
        return <LandingPage />;
      case "reports":
        return <ReportsPage />;
      case "report-detail":
        return <ReportDetail reportId={pageParams.id || ""} />;
      case "analysts":
        return <AnalystList />;
      case "analyst-detail":
        return <AnalystProfile analystId={pageParams.id || ""} />;
      case "forum":
        return <ForumPage />;
      case "forum-thread":
        return <ForumThread threadId={pageParams.id || ""} />;
      case "login":
        return <LoginForm />;
      case "register":
        return <RegisterForm />;
      case "dashboard":
        if (user?.role === "ADMIN") return <AdminDashboard />;
        if (user?.role === "ANALYST") return <AnalystDashboard />;
        return <UserDashboard />;
      case "admin":
        return <AdminDashboard />;
      case "pricing":
        return <PricingSection />;
      case "search":
        return <SearchPage query={pageParams.q || ""} />;
      default:
        return <LandingPage />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar />
      <main className="flex-1">{renderPage()}</main>
      <Footer />
    </div>
  );
}

// Landing page composition
function LandingPage() {
  return (
    <>
      <Hero />
      <Stats />
      <Categories />
      <FeaturedReports />
      <Testimonials />
      <PricingSection />
      <Newsletter />
    </>
  );
}

// Pricing section wrapper
function PricingSection() {
  return (
    <section className="py-20">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Pricing />
      </div>
    </section>
  );
}
