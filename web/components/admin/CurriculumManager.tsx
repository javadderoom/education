"use client";

import React, { useState, useEffect } from "react";
import { 
  Layers, 
  Plus, 
  ChevronDown, 
  ChevronLeft, 
  Edit3, 
  Trash2, 
  GraduationCap, 
  BookOpen, 
  SplitSquareVertical, 
  Calculator, 
  Scale, 
  Code, 
  Sparkles, 
  CheckCircle, 
  Settings2, 
  X, 
  AlertCircle,
  HelpCircle,
  Eye,
  EyeOff
} from "lucide-react";
import { 
  CurriculumFrameworkDTO, 
  CurriculumNodeDTO, 
  TierDefinition,
  getCurriculumFrameworksAction,
  getCurriculumTreeAction,
  createCurriculumNodeAction,
  updateCurriculumNodeAction,
  deleteCurriculumNodeAction,
  updateFrameworkTierDefinitionsAction
} from "@/actions/curriculum";
import { toPersianDigits } from "@/lib/math/persian-digits";

const ICON_MAP: Record<string, React.ElementType> = {
  GraduationCap,
  BookOpen,
  SplitSquareVertical,
  Calculator,
  Scale,
  Code,
  Sparkles,
  Layers,
  CheckCircle,
};

export const CurriculumManager: React.FC = () => {
  const [frameworks, setFrameworks] = useState<CurriculumFrameworkDTO[]>([]);
  const [selectedFrameworkId, setSelectedFrameworkId] = useState<string>("");
  const [activeFramework, setActiveFramework] = useState<CurriculumFrameworkDTO | null>(null);
  const [tree, setTree] = useState<CurriculumNodeDTO[]>([]);
  const [allNodes, setAllNodes] = useState<CurriculumNodeDTO[]>([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  // Expanded nodes map: nodeId -> boolean
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "NODE-G4": true,
    "NODE-G4-MATH": true,
    "NODE-G4-MATH-CH02": true,
  });

  // Modal State for Add / Edit Node
  const [nodeModal, setNodeModal] = useState<{
    isOpen: boolean;
    mode: "add" | "edit";
    parentId?: string | null;
    parentTitle?: string;
    targetDepth: number;
    node?: CurriculumNodeDTO | null;
  }>({
    isOpen: false,
    mode: "add",
    targetDepth: 1,
    node: null,
  });

  // Form State for Node
  const [formTitle, setFormTitle] = useState("");
  const [formShortTitle, setFormShortTitle] = useState("");
  const [formCode, setFormCode] = useState("");
  const [formDescription, setFormDescription] = useState("");
  const [formIcon, setFormIcon] = useState("Layers");
  const [formColor, setFormColor] = useState("indigo");
  const [formSubmitting, setFormSubmitting] = useState(false);

  // Modal State for Tier Definitions (Nomenclature)
  const [tierModalOpen, setTierModalOpen] = useState(false);
  const [editTiers, setEditTiers] = useState<TierDefinition[]>([]);

  // Load Frameworks on Mount
  useEffect(() => {
    async function load() {
      setLoading(true);
      const res = await getCurriculumFrameworksAction();
      if (res.success && res.frameworks.length > 0) {
        setFrameworks(res.frameworks);
        const defaultFw = res.frameworks.find((f) => f.isDefault) || res.frameworks[0];
        setSelectedFrameworkId(defaultFw.id);
      } else {
        setErrorMsg(res.error || "بارگذاری چارچوب‌ها با خطا مواجه شد.");
      }
      setLoading(false);
    }
    load();
  }, []);

  // Load Tree when selected framework changes
  useEffect(() => {
    if (!selectedFrameworkId) return;
    async function loadTree() {
      setLoading(true);
      setErrorMsg(null);
      const res = await getCurriculumTreeAction(selectedFrameworkId);
      if (res.success && res.framework) {
        setActiveFramework(res.framework);
        setTree(res.tree);
        setAllNodes(res.nodes);
        setEditTiers(res.framework.tierDefinitions);
        // Expand top-level nodes by default
        const newExpanded: Record<string, boolean> = {};
        res.tree.forEach((n) => {
          newExpanded[n.id] = true;
          n.children?.forEach((c) => {
            newExpanded[c.id] = true;
          });
        });
        setExpandedNodes((prev) => ({ ...prev, ...newExpanded }));
      } else {
        setErrorMsg(res.error || "خطا در واکشی درخت آموزشی.");
      }
      setLoading(false);
    }
    loadTree();
  }, [selectedFrameworkId]);

  const toggleNode = (nodeId: string) => {
    setExpandedNodes((prev) => ({
      ...prev,
      [nodeId]: !prev[nodeId],
    }));
  };

  const handleOpenAddNode = (parent?: CurriculumNodeDTO) => {
    const depth = parent ? parent.depth + 1 : 1;
    setNodeModal({
      isOpen: true,
      mode: "add",
      parentId: parent ? parent.id : null,
      parentTitle: parent ? parent.title : undefined,
      targetDepth: depth,
      node: null,
    });
    setFormTitle("");
    setFormShortTitle("");
    setFormCode("");
    setFormDescription("");
    setFormIcon(depth === 1 ? "GraduationCap" : depth === 2 ? "BookOpen" : depth === 3 ? "SplitSquareVertical" : "Layers");
    setFormColor(depth === 1 ? "indigo" : depth === 2 ? "emerald" : depth === 3 ? "amber" : "sky");
  };

  const handleOpenEditNode = (node: CurriculumNodeDTO) => {
    setNodeModal({
      isOpen: true,
      mode: "edit",
      parentId: node.parentId,
      targetDepth: node.depth,
      node,
    });
    setFormTitle(node.title);
    setFormShortTitle(node.shortTitle || "");
    setFormCode(node.code || "");
    setFormDescription(node.description || "");
    setFormIcon(node.icon || "Layers");
    setFormColor(node.color || "indigo");
  };

  const handleSubmitNodeForm = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formTitle.trim()) {
      setErrorMsg("عنوان گره نمی‌تواند خالی باشد.");
      return;
    }

    setFormSubmitting(true);
    setErrorMsg(null);

    if (nodeModal.mode === "add") {
      const res = await createCurriculumNodeAction({
        frameworkId: selectedFrameworkId,
        parentId: nodeModal.parentId,
        title: formTitle,
        shortTitle: formShortTitle || undefined,
        code: formCode || undefined,
        description: formDescription || undefined,
        icon: formIcon,
        color: formColor,
      });

      if (res.success) {
        setSuccessMsg("گره جدید با موفقیت ایجاد گردید.");
        setNodeModal({ isOpen: false, mode: "add", targetDepth: 1, node: null });
        // Refresh tree
        const treeRes = await getCurriculumTreeAction(selectedFrameworkId);
        if (treeRes.success) {
          setTree(treeRes.tree);
          setAllNodes(treeRes.nodes);
        }
      } else {
        setErrorMsg(res.error || "خطا در ایجاد گره.");
      }
    } else if (nodeModal.mode === "edit" && nodeModal.node) {
      const res = await updateCurriculumNodeAction(nodeModal.node.id, {
        title: formTitle,
        shortTitle: formShortTitle || undefined,
        code: formCode || undefined,
        description: formDescription || undefined,
        icon: formIcon,
        color: formColor,
      });

      if (res.success) {
        setSuccessMsg("اطلاعات گره با موفقیت به‌روزرسانی شد.");
        setNodeModal({ isOpen: false, mode: "add", targetDepth: 1, node: null });
        // Refresh tree
        const treeRes = await getCurriculumTreeAction(selectedFrameworkId);
        if (treeRes.success) {
          setTree(treeRes.tree);
          setAllNodes(treeRes.nodes);
        }
      } else {
        setErrorMsg(res.error || "خطا در به‌روزرسانی گره.");
      }
    }
    setFormSubmitting(false);
  };

  const handleDeleteNode = async (node: CurriculumNodeDTO) => {
    const confirmMessage = `آیا از حذف "${node.title}" مطمئن هستید؟ در صورت وجود زیرمجموعه، تمامی گره‌های فرزند نیز حذف خواهند شد.`;
    if (!window.confirm(confirmMessage)) return;

    setErrorMsg(null);
    const res = await deleteCurriculumNodeAction(node.id);
    if (res.success) {
      setSuccessMsg(`"${node.title}" با موفقیت حذف گردید.`);
      const treeRes = await getCurriculumTreeAction(selectedFrameworkId);
      if (treeRes.success) {
        setTree(treeRes.tree);
        setAllNodes(treeRes.nodes);
      }
    } else {
      setErrorMsg(res.error || "خطا در حذف گره.");
    }
  };

  const handleSaveTierDefinitions = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedFrameworkId) return;

    setFormSubmitting(true);
    const res = await updateFrameworkTierDefinitionsAction(selectedFrameworkId, editTiers);
    if (res.success) {
      setSuccessMsg("نام‌گذاری سطوح این چارچوب با موفقیت ذخیره شد.");
      setTierModalOpen(false);
      // Refresh framework info
      const fwRes = await getCurriculumFrameworksAction();
      if (fwRes.success) {
        setFrameworks(fwRes.frameworks);
        const active = fwRes.frameworks.find((f) => f.id === selectedFrameworkId);
        if (active) setActiveFramework(active);
      }
    } else {
      setErrorMsg(res.error || "خطا در ذخیره نام سطوح.");
    }
    setFormSubmitting(false);
  };

  const getTierForDepth = (depth: number): TierDefinition | undefined => {
    return activeFramework?.tierDefinitions.find((t) => t.depth === depth);
  };

  const renderNodeItem = (node: CurriculumNodeDTO) => {
    const isExpanded = !!expandedNodes[node.id];
    const hasChildren = node.children && node.children.length > 0;
    const tier = getTierForDepth(node.depth);
    const IconComponent = node.icon && ICON_MAP[node.icon] ? ICON_MAP[node.icon] : Layers;

    const depthColors = [
      "border-indigo-200 bg-indigo-50/30 text-indigo-700",
      "border-sky-200 bg-sky-50/30 text-sky-700",
      "border-amber-200 bg-amber-50/30 text-amber-700",
      "border-emerald-200 bg-emerald-50/30 text-emerald-700",
    ];
    const badgeColor = depthColors[node.depth - 1] || "border-slate-200 bg-slate-50 text-slate-700";

    return (
      <div key={node.id} className="mb-2">
        <div
          className={`flex items-center justify-between p-3 rounded-2xl border-2 transition-all duration-150 ${
            node.isActive
              ? "bg-white border-slate-200 hover:border-indigo-300 hover:shadow-xs"
              : "bg-slate-50 border-slate-200 opacity-60"
          }`}
          style={{ marginRight: `${(node.depth - 1) * 1.25}rem` }}
        >
          {/* Right: Expand Arrow + Depth Badge + Icon + Title */}
          <div className="flex items-center gap-2.5 min-w-0">
            {hasChildren ? (
              <button
                type="button"
                onClick={() => toggleNode(node.id)}
                className="w-7 h-7 rounded-lg hover:bg-slate-100 flex items-center justify-center text-slate-500 transition-colors cursor-pointer shrink-0"
              >
                {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
              </button>
            ) : (
              <div className="w-7 h-7 shrink-0 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-slate-300" />
              </div>
            )}

            {/* Depth / Tier Badge */}
            <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md border shrink-0 ${badgeColor}`}>
              {tier ? tier.singular : `سطح ${toPersianDigits(node.depth)}`}
            </span>

            {/* Node Icon */}
            <div className="w-8 h-8 rounded-xl bg-slate-100 flex items-center justify-center text-slate-700 shrink-0">
              <IconComponent className="w-4 h-4" />
            </div>

            {/* Title & Metadata */}
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-bold text-xs sm:text-sm text-slate-900 truncate">
                  {node.title}
                </span>
                {node.code && (
                  <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-100 text-slate-500 border border-slate-200 hidden sm:inline" dir="ltr">
                    {node.code}
                  </span>
                )}
              </div>
              {node.description && (
                <p className="text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {node.description}
                </p>
              )}
            </div>
          </div>

          {/* Left: Child Counts & Action Buttons */}
          <div className="flex items-center gap-1.5 shrink-0 mr-2">
            {node.childrenCount !== undefined && node.childrenCount > 0 && (
              <span className="text-[10px] font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full hidden sm:inline">
                {toPersianDigits(node.childrenCount)} زیرشاخه
              </span>
            )}

            {node.kcCount !== undefined && node.kcCount > 0 && (
              <span className="text-[10px] font-bold text-indigo-700 bg-indigo-50 border border-indigo-200 px-2 py-0.5 rounded-full hidden sm:inline">
                {toPersianDigits(node.kcCount)} مفهوم شناختی
              </span>
            )}

            {/* Add Child (if depth < 4) */}
            {node.depth < 4 && (
              <button
                type="button"
                onClick={() => handleOpenAddNode(node)}
                className="p-1.5 rounded-lg text-indigo-600 hover:bg-indigo-50 transition-colors cursor-pointer"
                title={`افزودن ${getTierForDepth(node.depth + 1)?.singular || "زیرمجموعه"}`}
              >
                <Plus className="w-4 h-4" />
              </button>
            )}

            {/* Edit */}
            <button
              type="button"
              onClick={() => handleOpenEditNode(node)}
              className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 transition-colors cursor-pointer"
              title="ویرایش"
            >
              <Edit3 className="w-4 h-4" />
            </button>

            {/* Delete */}
            <button
              type="button"
              onClick={() => handleDeleteNode(node)}
              className="p-1.5 rounded-lg text-rose-500 hover:bg-rose-50 transition-colors cursor-pointer"
              title="حذف"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Children Render */}
        {hasChildren && isExpanded && (
          <div className="mt-1 space-y-1">
            {node.children!.map((child) => renderNodeItem(child))}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="space-y-5 animate-in fade-in duration-300">
      {/* Alert Banners */}
      {errorMsg && (
        <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />
            <span>{errorMsg}</span>
          </div>
          <button onClick={() => setErrorMsg(null)} className="text-rose-500 hover:text-rose-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {successMsg && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-2xl text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-4 h-4 text-emerald-600 shrink-0" />
            <span>{successMsg}</span>
          </div>
          <button onClick={() => setSuccessMsg(null)} className="text-emerald-500 hover:text-emerald-700 p-1">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Controls: Framework Switcher & Add Root Node */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-bold text-slate-400 block mb-1">
            انتخاب چارچوب آموزشی فعال:
          </span>
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-2xl border border-slate-200">
            {frameworks.map((fw) => (
              <button
                key={fw.id}
                type="button"
                onClick={() => setSelectedFrameworkId(fw.id)}
                className={`py-1.5 px-3 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                  selectedFrameworkId === fw.id
                    ? "bg-white text-indigo-700 shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                <span>{fw.name}</span>
                {fw.isDefault && (
                  <span className="mr-1 text-[9px] px-1.5 py-0.2 bg-indigo-50 text-indigo-700 rounded-md">
                    پیش‌فرض
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-2 w-full sm:w-auto">
          <button
            type="button"
            onClick={() => setTierModalOpen(true)}
            className="flex-1 sm:flex-initial py-2.5 px-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl text-xs font-bold transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Settings2 className="w-4 h-4 text-slate-500" />
            <span>عناوین سطوح</span>
          </button>

          <button
            type="button"
            onClick={() => handleOpenAddNode()}
            className="flex-1 sm:flex-initial py-2.5 px-4 bg-indigo-600 hover:bg-indigo-700 text-white rounded-2xl text-xs font-bold shadow-xs transition-all flex items-center justify-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>افزودن {getTierForDepth(1)?.singular || "گره ریشه"}</span>
          </button>
        </div>
      </div>

      {/* Dynamic Tier Nomenclature Breadcrumb Banner */}
      {activeFramework && (
        <div className="bg-slate-50/70 border border-slate-200 rounded-2xl p-3 flex flex-wrap items-center justify-between gap-2 text-xs">
          <div className="flex items-center gap-2 text-slate-500">
            <HelpCircle className="w-4 h-4 text-slate-400 shrink-0" />
            <span>سلسله‌مراتب ۴ سطحی این چارچوب:</span>
          </div>

          <div className="flex items-center gap-1.5 font-bold text-slate-700 text-[11px]">
            {activeFramework.tierDefinitions.map((tier, idx) => (
              <React.Fragment key={tier.depth}>
                <span className="px-2 py-0.5 rounded-lg bg-white border border-slate-200 shadow-3xs">
                  {tier.title}
                </span>
                {idx < activeFramework.tierDefinitions.length - 1 && (
                  <span className="text-slate-400">←</span>
                )}
              </React.Fragment>
            ))}
          </div>
        </div>
      )}

      {/* Tree View Container */}
      <div className="bg-white border-2 border-slate-200 rounded-3xl p-4 sm:p-5 shadow-xs">
        <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-600" />
            <h3 className="font-black text-sm text-slate-900">
              درخت کامل سرفصل‌های {activeFramework?.name}
            </h3>
          </div>
          <span className="text-xs text-slate-400 font-bold">
            {toPersianDigits(allNodes.length)} گره ثبت‌شده در دیتابیس
          </span>
        </div>

        {loading ? (
          <div className="py-12 text-center text-xs text-slate-400">در حال واکشی ساختار آموزشی از پایگاه‌داده...</div>
        ) : tree.length === 0 ? (
          <div className="py-12 text-center">
            <p className="text-xs text-slate-400 mb-3">هیچ گره آموزشی برای این چارچوب تعریف نشده است.</p>
            <button
              type="button"
              onClick={() => handleOpenAddNode()}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-xs font-bold"
            >
              افزودن اولین گره
            </button>
          </div>
        ) : (
          <div className="space-y-1">
            {tree.map((rootNode) => renderNodeItem(rootNode))}
          </div>
        )}
      </div>

      {/* MODAL 1: Add / Edit Node Modal */}
      {nodeModal.isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h4 className="font-black text-base text-slate-900">
                  {nodeModal.mode === "add" ? "افزودن گره آموزشی جدید" : "ویرایش گره آموزشی"}
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  سطح {toPersianDigits(nodeModal.targetDepth)}: {getTierForDepth(nodeModal.targetDepth)?.title}
                  {nodeModal.parentTitle && ` (زیرمجموعه: ${nodeModal.parentTitle})`}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setNodeModal((p) => ({ ...p, isOpen: false }))}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmitNodeForm} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">
                  عنوان {getTierForDepth(nodeModal.targetDepth)?.singular || "گره"} <span className="text-rose-500">*</span>:
                </label>
                <input
                  type="text"
                  required
                  value={formTitle}
                  onChange={(e) => setFormTitle(e.target.value)}
                  placeholder={getTierForDepth(nodeModal.targetDepth)?.placeholder || "مثال: نام سرفصل"}
                  className="w-full p-3 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">عنوان کوتاه:</label>
                  <input
                    type="text"
                    value={formShortTitle}
                    onChange={(e) => setFormShortTitle(e.target.value)}
                    placeholder="مثال: کسرها"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">کد شناسه / شماره درس:</label>
                  <input
                    type="text"
                    value={formCode}
                    onChange={(e) => setFormCode(e.target.value)}
                    placeholder="مثال: MATH4-CH02"
                    dir="ltr"
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs font-mono text-slate-900 focus:outline-hidden focus:border-indigo-500 text-right"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1">توضیحات آموزشی:</label>
                <textarea
                  rows={2}
                  value={formDescription}
                  onChange={(e) => setFormDescription(e.target.value)}
                  placeholder="اهداف آموزشی یا خلاصه این سرفصل..."
                  className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 focus:outline-hidden focus:border-indigo-500"
                />
              </div>

              {/* Icon & Color Selection */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">آیکون:</label>
                  <select
                    value={formIcon}
                    onChange={(e) => setFormIcon(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  >
                    <option value="Layers">لایه‌ها (عمومی)</option>
                    <option value="BookOpen">کتاب</option>
                    <option value="GraduationCap">کلاه فارغ‌التحصیلی</option>
                    <option value="SplitSquareVertical">کسر و تقسیم‌بندی</option>
                    <option value="Calculator">ماشین‌حساب / ضرب</option>
                    <option value="Scale">ترازو / تناسب</option>
                    <option value="Code">کد / برنامه‌نویسی</option>
                    <option value="Sparkles">ستاره / آزمایشگاه</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-slate-700 mb-1">تم رنگی:</label>
                  <select
                    value={formColor}
                    onChange={(e) => setFormColor(e.target.value)}
                    className="w-full p-2.5 rounded-xl border border-slate-300 text-xs text-slate-900 bg-white"
                  >
                    <option value="indigo">نیلی (Indigo)</option>
                    <option value="emerald">زمردی (Emerald)</option>
                    <option value="amber">کهربایی (Amber)</option>
                    <option value="sky">آبی روشن (Sky)</option>
                    <option value="rose">رز (Rose)</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setNodeModal((p) => ({ ...p, isOpen: false }))}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {formSubmitting ? "در حال ذخیره..." : nodeModal.mode === "add" ? "ثبت گره جدید" : "ذخیره تغییرات"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: Tier Nomenclature Definition Customization */}
      {tierModalOpen && activeFramework && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border-2 border-slate-200 max-h-[92vh] overflow-y-auto animate-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h4 className="font-black text-base text-slate-900">
                  سفارشی‌سازی نام‌گذاری سطوح ({activeFramework.name})
                </h4>
                <p className="text-xs text-slate-500 mt-0.5">
                  می‌توانید عنوان هر کدام از سطوح ۱ تا ۴ را بر اساس ترمینولوژی سازمان خود تغییر دهید
                </p>
              </div>
              <button
                type="button"
                onClick={() => setTierModalOpen(false)}
                className="w-8 h-8 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSaveTierDefinitions} className="space-y-4">
              {editTiers.map((tier, idx) => (
                <div key={tier.depth} className="p-3 bg-slate-50 rounded-2xl border border-slate-200 space-y-2">
                  <span className="text-xs font-black text-slate-700 block">
                    سطح {toPersianDigits(tier.depth)}:
                  </span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">عنوان کامل سطح:</label>
                      <input
                        type="text"
                        required
                        value={tier.title}
                        onChange={(e) => {
                          const next = [...editTiers];
                          next[idx].title = e.target.value;
                          setEditTiers(next);
                        }}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] text-slate-500 mb-0.5">نام مفرد برای دکمه‌ها:</label>
                      <input
                        type="text"
                        required
                        value={tier.singular}
                        onChange={(e) => {
                          const next = [...editTiers];
                          next[idx].singular = e.target.value;
                          setEditTiers(next);
                        }}
                        className="w-full p-2 rounded-lg border border-slate-300 text-xs bg-white text-slate-900"
                      />
                    </div>
                  </div>
                </div>
              ))}

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setTierModalOpen(false)}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100"
                >
                  انصراف
                </button>
                <button
                  type="submit"
                  disabled={formSubmitting}
                  className="px-5 py-2.5 rounded-xl text-xs font-bold bg-indigo-600 hover:bg-indigo-700 text-white shadow-xs"
                >
                  {formSubmitting ? "در حال ذخیره..." : "ذخیره عناوین سطوح"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
