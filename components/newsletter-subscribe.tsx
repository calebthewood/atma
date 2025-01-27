"use client";

import React, { useEffect, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Confetti from "react-dom-confetti";

import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

// import { subscribeToNewsletter } from "@/actions/user-actions";

export default function NewsletterSubscribe() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

  // Initialize Flodesk
  useEffect(() => {
    // Define Flodesk initialization function
    const initFlodesk = (w: any, d: any, t: any, h: any, s: any, n: any) => {
      w.FlodeskObject = n;
      const fn = function () {
        (w[n].q = w[n].q || []).push(arguments);
      };
      w[n] = w[n] || fn;

      const f = d.getElementsByTagName(t)[0];
      const v = "?v=" + Math.floor(new Date().getTime() / (120 * 1000)) * 60;

      const sm = d.createElement(t);
      sm.async = true;
      sm.type = "module";
      sm.src = h + s + ".mjs" + v;
      f.parentNode.insertBefore(sm, f);

      const sn = d.createElement(t);
      sn.async = true;
      sn.noModule = true;
      sn.src = h + s + ".js" + v;
      f.parentNode.insertBefore(sn, f);
    };

    // Initialize Flodesk
    initFlodesk(
      window,
      document,
      "script",
      "https://assets.flodesk.com",
      "/universal",
      "fd"
    );
  }, []);

  const handleClick = async () => {
    if (!isExpanded) {
      setIsExpanded(true);
      return;
    }

    if (!email) {
      toast({
        title: "Error",
        description: "Please enter your email address",
        variant: "destructive",
      });
      return;
    }

    setIsSubmitting(true);

    try {
      // @ts-ignore Submit to Flodesk
      window.fd("form:submit", {
        formId: "66d66e18780dc961677cd3c5",
        data: { email: email },
      });

      setIsSubscribed(true);
      setIsExpanded(false);
      toast({
        title: "Success!",
        description: "You've been subscribed to our newsletter.",
      });
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error ? error.message : "Failed to subscribe",
        variant: "destructive",
      });
    } finally {
      setIsSubmitting(false);
    }
  };

  const tinyExplodeProps = {
    force: 0.4,
    duration: 2000,
    particleCount: 30,
    height: 500,
    width: 300,
  };

  return (
    <motion.div className="relative flex justify-center" initial={false}>
      <motion.div
        className="flex items-center overflow-hidden rounded-[67px] border border-[#841729] bg-[#841729]"
        animate={{
          width: isExpanded ? "auto" : "fit-content",
        }}
      >
        <AnimatePresence>
          {isExpanded && (
            <motion.div
              initial={{ width: 0, opacity: 0 }}
              animate={{ width: 200, opacity: 1 }}
              exit={{ width: 0, opacity: 0 }}
              className="ml-[26px]"
            >
              <Input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="h-[28px] rounded border-none bg-white/10 text-white placeholder:text-white/60"
                disabled={isSubmitting}
              />
            </motion.div>
          )}
        </AnimatePresence>

        <motion.button
          onClick={handleClick}
          disabled={isSubmitting}
          className="flex h-[42.80px] items-center justify-center px-[26.13px] py-[13.40px]"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <motion.span
            className="font-['Instrument Sans'] text-[13px] font-semibold uppercase text-white"
            animate={{ opacity: isSubmitting ? 0.5 : 1 }}
          >
            {isSubscribed ? "SUBSCRIBED" : "SUBSCRIBE"}
          </motion.span>
        </motion.button>
      </motion.div>
      {
        <div className="absolute left-1/2 top-1/2 z-10">
          <Confetti active={isSubscribed} />
        </div>
      }
    </motion.div>
  );
}
