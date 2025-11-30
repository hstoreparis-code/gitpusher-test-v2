import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent } from "@/components/ui/card";

export function OAuthCallback() {
  const navigate = useNavigate();
  const [status, setStatus] = useState("processing");
  const [message, setMessage] = useState("Authentification en cours...");

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get("token");
    const error = params.get("error");

    if (token) {
      localStorage.setItem("token", token);
      setStatus("success");
      setMessage("Connexion réussie ! Redirection...");
      setTimeout(() => {
        navigate("/app");
      }, 1000);
    } else if (error) {
      setStatus("error");
      const errorMessages = {
        oauth_not_configured: "OAuth n'est pas configuré sur le serveur",
        failed_token_exchange: "Échec de l'échange du code d'autorisation",
        failed_profile_fetch: "Impossible de récupérer votre profil",
        no_github_token: "Aucun token GitHub reçu",
        oauth_failed: "Échec de l'authentification OAuth"
      };
      setMessage(errorMessages[error] || "Une erreur s'est produite lors de la connexion");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    } else {
      setStatus("error");
      setMessage("Paramètres d'authentification manquants");
      setTimeout(() => {
        navigate("/");
      }, 3000);
    }
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-950 via-slate-900 to-slate-950 text-slate-50 flex items-center justify-center">
      <Card className="bg-slate-900/70 border-white/10 shadow-2xl shadow-cyan-500/20 text-slate-50 max-w-md w-full mx-4">
        <CardContent className="pt-6 pb-6 text-center space-y-4">
          {status === "processing" && (
            <>
              <div className="w-12 h-12 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
              <p className="text-sm text-slate-300">{message}</p>
            </>
          )}
          {status === "success" && (
            <>
              <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
                </svg>
              </div>
              <p className="text-sm text-slate-300">{message}</p>
            </>
          )}
          {status === "error" && (
            <>
              <div className="w-12 h-12 rounded-full bg-red-500/20 flex items-center justify-center mx-auto">
                <svg className="w-6 h-6 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path>
                </svg>
              </div>
              <p className="text-sm text-red-300">{message}</p>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
