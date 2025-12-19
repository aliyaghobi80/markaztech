// مسیر: src/components/SatisfactionSurvey.jsx
"use client";

import { useState, useEffect } from "react";
import { ThumbsUp, ThumbsDown, CheckCircle2, MessageSquareHeart } from "lucide-react";
import api from "@/lib/axios";
import { useAuth } from "@/context/AuthContext";
import toast from "react-hot-toast";

export default function SatisfactionSurvey() {
  const { user } = useAuth();
  const [hasVoted, setHasVoted] = useState(false);
  const [loading, setLoading] = useState(true);
  const [showSurvey, setShowSurvey] = useState(false);

  useEffect(() => {
    if (user) {
      checkVoteStatus();
    } else {
      setLoading(false);
    }
  }, [user]);

  const checkVoteStatus = async () => {
    try {
      // First check if user has purchased anything
      const statsRes = await api.get("/users/site-stats/"); // We'll use this to trigger or just try to get vote
      const voteRes = await api.get("/users/satisfaction/my_vote/");
      
      if (voteRes.data.is_satisfied !== null) {
        setHasVoted(true);
      } else {
        // Only show if user has at least one paid order
        const ordersRes = await api.get("/orders/");
        const hasPurchased = ordersRes.data.some(o => o.status === 'PAID' || o.status === 'SENT');
        if (hasPurchased) {
          setShowSurvey(true);
        }
      }
    } catch (error) {
      console.error("Error checking satisfaction status");
    } finally {
      setLoading(false);
    }
  };

  const handleVote = async (isSatisfied) => {
    try {
      await api.post("/users/satisfaction/", { is_satisfied: isSatisfied });
      setHasVoted(true);
      setShowSurvey(false);
      toast.success("از ثبت نظر شما سپاسگزاریم!", {
        icon: '❤️',
        style: {
          borderRadius: '15px',
          background: '#333',
          color: '#fff',
        },
      });
    } catch (error) {
      toast.error(error.response?.data?.[0] || "خطا در ثبت نظر");
    }
  };

  if (loading || !showSurvey || hasVoted) return null;

  return (
    <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-10 duration-500 max-w-sm w-full px-4">
      <div className="bg-card border-2 border-primary/20 rounded-3xl shadow-2xl p-6 relative overflow-hidden backdrop-blur-xl">
        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-primary to-blue-500"></div>
        <div className="absolute -top-10 -right-10 w-24 h-24 bg-primary/10 rounded-full blur-2xl"></div>
        
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center flex-shrink-0 text-primary">
            <MessageSquareHeart className="w-6 h-6" />
          </div>
          <div>
            <h4 className="font-black text-foreground text-sm mb-1">مرکزتک چطور بود؟</h4>
            <p className="text-foreground-muted text-[11px] leading-relaxed mb-4">
              {user?.full_name || 'کاربر گرامی'} عزیز، از خرید شما سپاسگزاریم. آیا از خدمات ما راضی بودید؟
            </p>
            
            <div className="flex gap-2">
              <button
                onClick={() => handleVote(true)}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-bold py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition-all shadow-lg shadow-green-500/20"
              >
                <ThumbsUp className="w-3.5 h-3.5" />
                بله، عالی بود
              </button>
              <button
                onClick={() => handleVote(false)}
                className="flex-1 bg-secondary hover:bg-destructive hover:text-white text-foreground-muted font-bold py-2 rounded-xl text-[10px] flex items-center justify-center gap-1.5 transition-all"
              >
                <ThumbsDown className="w-3.5 h-3.5" />
                ناراضی بودم
              </button>
            </div>
          </div>
        </div>
        
        <button 
          onClick={() => setShowSurvey(false)}
          className="absolute top-3 left-3 text-foreground-muted/50 hover:text-foreground transition-colors"
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );
}
