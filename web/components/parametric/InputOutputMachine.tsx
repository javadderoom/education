"use client";

import React from "react";
import { toPersianDigits } from "../../lib/math/persian-digits";
import { ArrowDown, ArrowLeft, Cog } from "lucide-react";

export interface MachineOperation {
  op: "add" | "sub" | "mul" | "div";
  value: number;
}

export interface InputOutputMachineProps {
  inputVal?: number | string; // number or "؟"
  outputVal?: number | string; // number or "؟"
  operations: MachineOperation[];
  machineTitle?: string;
  tablePairs?: { input: number | string; output: number | string }[];
  showTable?: boolean;
  label?: string;
}

export const InputOutputMachine: React.FC<InputOutputMachineProps> = ({
  inputVal,
  outputVal,
  operations = [{ op: "mul", value: 3 }],
  machineTitle = "ماشین ورودی ــ خروجی",
  tablePairs,
  showTable = false,
  label,
}) => {
  const getOpSymbol = (op: string) => {
    switch (op) {
      case "add":
        return "+";
      case "sub":
        return "−";
      case "mul":
        return "×";
      case "div":
        return "÷";
      default:
        return op;
    }
  };

  const getOpPersianText = (op: string, val: number) => {
    switch (op) {
      case "add":
        return `به علاوه ${toPersianDigits(val)}`;
      case "sub":
        return `منهای ${toPersianDigits(val)}`;
      case "mul":
        return `ضرب در ${toPersianDigits(val)}`;
      case "div":
        return `تقسیم بر ${toPersianDigits(val)}`;
      default:
        return "";
    }
  };

  return (
    <div className="w-full flex flex-col items-center my-4 select-none" dir="rtl">
      {label && <p className="text-sm font-bold text-slate-800 mb-2">{label}</p>}

      <div className="w-full max-w-md bg-gradient-to-b from-slate-50 to-indigo-50/30 border-2 border-indigo-200 rounded-3xl p-4 shadow-sm flex flex-col items-center">
        {/* Machine Header */}
        <div className="flex items-center gap-2 mb-3 bg-white px-3 py-1 rounded-full border border-indigo-200 shadow-xs">
          <Cog className="w-4 h-4 text-indigo-600 animate-spin" style={{ animationDuration: "8s" }} />
          <span className="text-xs font-black text-indigo-950">{machineTitle}</span>
        </div>

        {/* Input Badge */}
        <div className="flex flex-col items-center">
          <span className="text-[11px] font-bold text-slate-500 mb-1">ورودی</span>
          <div className="flex items-center justify-center min-w-16 h-10 px-3 bg-white border-2 border-blue-400 rounded-2xl shadow-sm">
            <span className="text-lg font-black text-blue-700" dir="ltr">
              {inputVal !== undefined ? toPersianDigits(inputVal) : "؟"}
            </span>
          </div>
          <ArrowDown className="w-5 h-5 text-blue-500 my-1 animate-bounce" />
        </div>

        {/* Central Machine Box */}
        <div className="w-full bg-white border-2 border-indigo-300 rounded-2xl p-3 shadow-md relative overflow-hidden">
          {/* Subtle Decorative Pattern */}
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500" />

          <div className="flex flex-col gap-2">
            {operations.map((opItem, idx) => (
              <div
                key={idx}
                className="flex items-center justify-between bg-slate-50 border border-slate-200 rounded-xl px-3 py-2"
              >
                <div className="flex items-center gap-2">
                  <span className="w-5 h-5 flex items-center justify-center rounded-full bg-indigo-100 text-indigo-700 font-bold text-[11px]">
                    {toPersianDigits(idx + 1)}
                  </span>
                  <span className="text-xs font-bold text-slate-700">
                    {getOpPersianText(opItem.op, opItem.value)}
                  </span>
                </div>
                <div
                  className="font-black text-sm px-2.5 py-0.5 rounded-lg bg-indigo-600 text-white shadow-xs"
                  dir="ltr"
                >
                  {getOpSymbol(opItem.op)} {toPersianDigits(opItem.value)}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Output Arrow & Badge */}
        <div className="flex flex-col items-center mt-1">
          <ArrowDown className="w-5 h-5 text-emerald-500 my-1 animate-bounce" />
          <div className="flex items-center justify-center min-w-16 h-10 px-3 bg-white border-2 border-emerald-400 rounded-2xl shadow-sm">
            <span className="text-lg font-black text-emerald-700" dir="ltr">
              {outputVal !== undefined ? toPersianDigits(outputVal) : "؟"}
            </span>
          </div>
          <span className="text-[11px] font-bold text-slate-500 mt-1">خروجی</span>
        </div>

        {/* Data Pairs Table (Optional) */}
        {showTable && tablePairs && tablePairs.length > 0 && (
          <div className="w-full mt-4 pt-3 border-t border-indigo-100">
            <p className="text-[11px] font-bold text-slate-600 mb-2 text-center">
              جدول داده‌های ورودی و خروجی:
            </p>
            <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white">
              <table className="w-full text-center text-xs">
                <thead>
                  <tr className="bg-slate-100 text-slate-700 border-b border-slate-200">
                    <th className="py-1 px-2 border-l border-slate-200 font-bold text-blue-700">ورودی</th>
                    {tablePairs.map((pair, pIdx) => (
                      <td key={pIdx} className="py-1 px-2 border-l border-slate-200 font-black text-slate-800" dir="ltr">
                        {toPersianDigits(pair.input)}
                      </td>
                    ))}
                  </tr>
                  <tr className="bg-emerald-50/50 text-slate-700">
                    <th className="py-1 px-2 border-l border-slate-200 font-bold text-emerald-700">خروجی</th>
                    {tablePairs.map((pair, pIdx) => (
                      <td key={pIdx} className="py-1 px-2 border-l border-slate-200 font-black text-slate-800" dir="ltr">
                        {toPersianDigits(pair.output)}
                      </td>
                    ))}
                  </tr>
                </thead>
              </table>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
