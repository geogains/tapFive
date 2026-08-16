"use client";

import React from "react";
import { motion } from "motion/react";
import { cn } from "@/lib/utils";

export const TestimonialsColumn = (props: {
  className?: string;
  /** Card max-width utility class(es), e.g. to widen cards on wider layouts. Defaults to the original `max-w-xs`. */
  cardClassName?: string;
  testimonials: {
    text: string;
    name: string;
    role: string;
  }[];
  duration?: number;
}) => {
  return (
    <div className={props.className}>
      <motion.div
        animate={{
          translateY: "-50%",
        }}
        transition={{
          duration: props.duration || 10,
          repeat: Infinity,
          ease: "linear",
          repeatType: "loop",
        }}
        className="flex flex-col gap-6 pb-6"
      >
        {[
          ...new Array(2).fill(0).map((_, index) => (
            <React.Fragment key={index}>
              {props.testimonials.map(
                ({ text, name, role }, i) => (
                  <div
                    className={cn(
                      "p-10 rounded-3xl border border-tf-neutral-200 shadow-lg shadow-tf-accent/10 w-full bg-tf-white",
                      props.cardClassName ?? "max-w-xs",
                    )}
                    key={i}
                  >
                    <div className="text-sm leading-relaxed text-tf-neutral-700">{text}</div>

                    <div className="flex flex-col mt-5">
                      <div className="font-medium tracking-tight leading-5 text-tf-black">
                        {name}
                      </div>
                      <div className="leading-5 opacity-60 tracking-tight text-tf-neutral-600">
                        {role}
                      </div>
                    </div>
                  </div>
                )
              )}
            </React.Fragment>
          )),
        ]}
      </motion.div>
    </div>
  );
};
