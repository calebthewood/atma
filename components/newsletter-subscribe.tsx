"use client";

import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";

import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";

// import { subscribeToNewsletter } from "@/actions/user-actions";

export default function NewsletterSubscribe() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [email, setEmail] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubscribed, setIsSubscribed] = useState(false);
  const { toast } = useToast();

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
      const result = setTimeout(() => console.log("Add this"), 500);

      if (result) {
        setIsSubscribed(true);
        setIsExpanded(false);
        toast({
          title: "Success!",
          description: "You've been subscribed to our newsletter.",
        });
      } else {
        throw new Error(result || "Subscription failed");
      }
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

  return (
    <motion.div className="flex justify-center" initial={false}>
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
    </motion.div>
  );
}
