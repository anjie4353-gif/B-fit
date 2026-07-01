"use client";

import { useState } from "react";
import { Droplets, Footprints, Moon, Smile, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useUserStore } from "@/hooks/useUserStore";
import { format } from "date-fns";
import type { DailyLog } from "@/types";
import { cn } from "@/lib/utils";

const moodLabels = ["Low", "Meh", "Okay", "Good", "Great"];

export function DailyLogForm() {
  const { addDailyLog, dailyLogs, profile } = useUserStore();
  const waterGoal = profile?.waterReminderSettings?.dailyGlasses ?? 8;
  const today = format(new Date(), "yyyy-MM-dd");
  const existing = dailyLogs.find((l) => l.date === today);

  const [water, setWater] = useState(existing?.waterIntake ?? 0);
  const [steps, setSteps] = useState(existing?.steps ?? 0);
  const [sleep, setSleep] = useState(existing?.sleepHours ?? 7);
  const [mood, setMood] = useState<1 | 2 | 3 | 4 | 5>(existing?.mood ?? 3);
  const [energy, setEnergy] = useState<1 | 2 | 3 | 4 | 5>(existing?.energyLevel ?? 3);
  const [saved, setSaved] = useState(false);

  const save = () => {
    const log: DailyLog = {
      date: today,
      waterIntake: water,
      steps,
      sleepHours: sleep,
      mood,
      energyLevel: energy,
    };
    addDailyLog(log);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Today&apos;s Log</CardTitle>
      </CardHeader>
      <CardContent className="space-y-5">
        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Droplets className="h-4 w-4 text-accent-500" />
            Water (glasses)
          </Label>
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={() => setWater(Math.max(0, water - 1))}
              className="glass glass-interactive h-10 w-10 rounded-xl text-accent-600 font-bold"
            >
              −
            </button>
            <span className="text-2xl font-semibold text-accent-900 w-8 text-center">
              {water}
            </span>
            <button
              type="button"
              onClick={() => setWater(water + 1)}
              className="glass glass-interactive h-10 w-10 rounded-xl text-accent-600 font-bold"
            >
              +
            </button>
            <span className="text-xs text-accent-500">Goal: {waterGoal} glasses</span>
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Footprints className="h-4 w-4 text-accent-500" />
            Steps
          </Label>
          <Input
            type="number"
            inputMode="numeric"
            value={steps}
            onChange={(e) => setSteps(parseInt(e.target.value) || 0)}
            placeholder="8000"
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Moon className="h-4 w-4 text-accent-400" />
            Sleep (hours)
          </Label>
          <Input
            type="number"
            inputMode="decimal"
            step="0.5"
            value={sleep}
            onChange={(e) => setSleep(parseFloat(e.target.value) || 0)}
          />
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Smile className="h-4 w-4 text-accent-400" />
            Mood
          </Label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setMood(v)}
                className={cn(
                  "flex-1 rounded-xl py-2 text-xs font-medium transition-colors min-h-[44px]",
                  mood === v
                    ? "glass-btn-primary text-white"
                    : "glass text-accent-500"
                )}
              >
                {moodLabels[v - 1]}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <Label className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-accent-500" />
            Energy
          </Label>
          <div className="flex gap-2">
            {([1, 2, 3, 4, 5] as const).map((v) => (
              <button
                key={v}
                type="button"
                onClick={() => setEnergy(v)}
                className={cn(
                  "flex-1 rounded-xl py-2 text-xs font-medium transition-colors min-h-[44px]",
                  energy === v
                    ? "glass-btn-primary text-white"
                    : "glass text-accent-600"
                )}
              >
                {v}
              </button>
            ))}
          </div>
        </div>

        <Button onClick={save} className="w-full">
          {saved ? "Saved!" : "Save Today's Log"}
        </Button>
      </CardContent>
    </Card>
  );
}