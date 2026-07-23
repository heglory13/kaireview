"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { type ChangeEvent, useCallback, useEffect, useId, useRef, useState } from "react";
import type { LucideIcon } from "lucide-react";
import {
  AlignCenter,
  AlignLeft,
  AlignRight,
  BarChart3,
  Bell,
  Bold,
  ContactRound,
  FileText,
  Gauge,
  Globe2,
  Home,
  Image as ImageIcon,
  Italic,
  KeyRound,
  Link2,
  List,
  ListOrdered,
  LogOut,
  Mail,
  Maximize2,
  Menu,
  Minimize2,
  Moon,
  Quote,
  Search,
  Sun,
  Table2,
  TableOfContents,
  Undo2,
  Unlink,
  UserRound,
  UsersRound,
  X,
} from "lucide-react";

import { cn } from "@/lib/utils";
import type {
  AdminDashboardCard,
  AdminDashboardData,
  AdminMetric,
  AdminSectionData,
} from "@/types/admin";

type AdminNavItem = {
  href: string;
  icon: LucideIcon;
  label: string;
};

type AdminNavSection = {
  items: AdminNavItem[];
  title: string;
};

const navSections: AdminNavSection[] = [
  {
    title: "Tổng quan",
    items: [{ label: "Dashboard", href: "/admin", icon: Gauge }],
  },
  {
    title: "Quản lý bài viết",
    items: [
      {
        label: "Đăng bài viết",
        icon: FileText,
        href: "/admin/bai-viet",
      },
    ],
  },
  {
    title: "Quản lý trang",
    items: [
      { label: "Giới thiệu", href: "/admin/trang/gioi-thieu", icon: Home },
    ],
  },
  {
    title: "Liên hệ",
    items: [
      { label: "Tin liên hệ", href: "/admin/lien-he", icon: ContactRound },
    ],
  },
];

const cardIcons: Record<AdminDashboardCard["id"], LucideIcon> = {
  account: UsersRound,
  contact: Mail,
  password: KeyRound,
  post: FileText,
  site: Globe2,
};
const customSelectValue = "__custom__";
const editorBlockOptions = [
  { label: "Paragraph", value: "p" },
  { label: "Heading 2", value: "h2" },
  { label: "Heading 3", value: "h3" },
  { label: "Quote", value: "blockquote" },
] as const;

type EditorBlock = (typeof editorBlockOptions)[number]["value"];

type AdminImageUploadResponse = {
  message?: string;
  url?: string;
};

export function KaiAdminDashboard({
  dashboardData,
  sectionData,
}: {
  dashboardData: AdminDashboardData;
  sectionData?: AdminSectionData;
}) {
  const pathname = usePathname();
  const router = useRouter();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  async function handleLogout() {
    await fetch("/api/admin/logout", { method: "POST" });
    router.refresh();
  }

  return (
    <div className="min-h-screen bg-[#eef2f8] text-[#23283b]">
      <button
        aria-label="Open admin menu"
        className="fixed left-4 top-4 z-40 flex size-11 items-center justify-center rounded-[6px] bg-white text-[#b00632] shadow-[0_4px_18px_rgba(31,42,68,0.16)] lg:hidden"
        onClick={() => setIsSidebarOpen(true)}
        type="button"
      >
        <Menu className="size-6" strokeWidth={2.2} />
      </button>

      <div
        className={cn(
          "fixed inset-0 z-40 bg-[#1b2134]/45 transition-opacity lg:hidden",
          isSidebarOpen ? "opacity-100" : "pointer-events-none opacity-0",
        )}
        onClick={() => setIsSidebarOpen(false)}
      />

      <AdminSidebar
        activePath={pathname}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
      />

      <main className="min-h-screen lg:pl-[292px]">
        <div className="mx-auto max-w-[1440px] px-4 py-4 pt-[74px] sm:px-6 lg:px-7 lg:py-6 lg:pt-6">
          <AdminTopBar
            notificationCount={dashboardData.unreadMessageCount}
            onLogout={handleLogout}
            searchQuery={dashboardData.searchQuery}
          />

          {dashboardData.statusMessage ? (
            <div className="mt-4 border border-[#d8e8d3] bg-[#f3fbf0] px-4 py-3 text-[14px] font-bold text-[#2f6f28]">
              {dashboardData.statusMessage}
            </div>
          ) : null}

          <AdminSearchResults
            query={dashboardData.searchQuery}
            results={dashboardData.searchResults}
          />

          {sectionData ? (
            <AdminSectionContent sectionData={sectionData} />
          ) : (
            <>
              <section className="mt-5">
                <h1 className="mb-4 text-[28px] font-bold leading-tight text-[#2d3245]">
                  Bảng điều khiển
                </h1>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {dashboardData.shortcutCards.map((card) => (
                    <ShortcutCard card={card} key={card.title} />
                  ))}
                </div>
              </section>

              <section className="mt-8">
                <h2 className="mb-4 text-[24px] font-bold leading-tight text-[#4a4f5f]">
                  Dữ liệu nội dung
                </h2>
                <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
                  {dashboardData.contentStats.map((stat) => (
                    <MetricCard key={stat.label} {...stat} />
                  ))}
                </div>
              </section>

              <AdminDataPanels dashboardData={dashboardData} />
            </>
          )}
        </div>
      </main>
    </div>
  );
}

function AdminSidebar({
  activePath,
  isOpen,
  onClose,
}: {
  activePath: string;
  isOpen: boolean;
  onClose: () => void;
}) {
  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-50 flex w-[292px] flex-col bg-white shadow-[5px_0_25px_rgba(31,42,68,0.12)] transition-transform duration-300 lg:translate-x-0",
        isOpen ? "translate-x-0" : "-translate-x-full",
      )}
    >
      <div className="flex h-[98px] items-center px-8">
        <Link aria-label="kaireview admin" className="block" href="/admin">
          <span className="block font-serif text-[48px] font-black leading-[44px]">
            <span className="text-[#d60a26]">K</span>
            <span className="text-[#095ca8]">AI</span>
          </span>
          <span className="block text-[9px] font-bold uppercase leading-none text-[#6f7481]">
            INSIGHT AND ADVICE
          </span>
        </Link>
        <button
          aria-label="Close admin menu"
          className="ml-auto flex size-9 items-center justify-center text-[#6f7481] lg:hidden"
          onClick={onClose}
          type="button"
        >
          <X className="size-7" strokeWidth={2.2} />
        </button>
      </div>

      <nav className="min-h-0 flex-1 overflow-y-auto px-[6px] pb-5">
        {navSections.map((section) => (
          <div className="mb-5" key={section.title}>
            <h3 className="px-[10px] pb-3 text-[15px] font-black uppercase leading-[18px] text-[#b00632]">
              {section.title}
            </h3>
            <ul className="space-y-1">
              {section.items.map((item) => (
                <AdminNavRow
                  activePath={activePath}
                  item={item}
                  key={`${section.title}-${item.label}`}
                  onClose={onClose}
                />
              ))}
            </ul>
          </div>
        ))}
      </nav>

      <div className="border-t border-[#eef0f5] px-8 py-4">
        <div className="flex items-center gap-3 text-[#8a91a2]">
          <Moon className="size-5 text-[#ca8b02]" strokeWidth={2.2} />
          <div>
            <div className="text-[13px] font-bold leading-tight">30°C</div>
            <div className="text-[12px] leading-tight">Trời quang</div>
          </div>
        </div>
      </div>
    </aside>
  );
}

function AdminNavRow({
  activePath,
  item,
  onClose,
}: {
  activePath: string;
  item: AdminNavItem;
  onClose: () => void;
}) {
  const Icon = item.icon;
  const isItemActive = activePath === item.href;
  const rowClassName = cn(
    "flex h-[52px] w-full items-center gap-4 px-[18px] text-left text-[18px] font-medium transition-colors",
    isItemActive
      ? "bg-[#8b0c28] text-white shadow-[0_6px_14px_rgba(139,12,40,0.18)]"
      : "text-[#7e8491] hover:bg-[#f5f6f9] hover:text-[#b00632]",
  );

  return (
    <li>
      <Link className={rowClassName} href={item.href} onClick={onClose}>
        <Icon className="size-6 shrink-0" strokeWidth={1.8} />
        <span className="min-w-0 flex-1 truncate">{item.label}</span>
      </Link>
    </li>
  );
}

function AdminSearchResults({
  query,
  results,
}: {
  query: string;
  results: AdminDashboardData["searchResults"];
}) {
  if (!query) {
    return null;
  }

  return (
    <section className="mt-4 border border-[#dfe6f2] bg-white p-4 shadow-[0_5px_18px_rgba(31,42,68,0.08)]">
      <div className="mb-3 flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-[20px] font-bold leading-tight text-[#2d3245]">Kết quả tìm kiếm</h2>
        <span className="text-[14px] font-medium text-[#7b8394]">{query}</span>
      </div>
      {results.length ? (
        <div className="grid grid-cols-1 gap-3 lg:grid-cols-2">
          {results.map((result) => (
            <Link
              className="border border-[#e3e9f2] px-4 py-3 transition-colors hover:border-[#b00632]"
              href={result.href}
              key={`${result.kind}-${result.href}-${result.title}`}
            >
              <span className="block text-[12px] font-black uppercase leading-none text-[#b00632]">
                {result.kind}
              </span>
              <span className="mt-2 block text-[16px] font-bold leading-5 text-[#263047]">
                {result.title}
              </span>
              <span className="mt-1 line-clamp-2 block text-[13px] leading-5 text-[#737b8c]">
                {result.excerpt || "Không có mô tả."}
              </span>
            </Link>
          ))}
        </div>
      ) : (
        <p className="text-[14px] leading-6 text-[#737b8c]">Không có dữ liệu phù hợp trong SQLite.</p>
      )}
    </section>
  );
}

function AdminSectionContent({ sectionData }: { sectionData: AdminSectionData }) {
  const pagination = sectionData.crud.pagination;
  const isArticleSection = sectionData.crud.entity === "article";

  return (
    <section className="mt-5">
      <div className="border border-[#dfe6f2] bg-white p-5 shadow-[0_5px_18px_rgba(31,42,68,0.08)]">
        <div className="flex flex-col gap-2 md:flex-row md:items-end md:justify-between">
          <div>
            <span className="text-[12px] font-black uppercase text-[#b00632]">
              /admin/{sectionData.slug}
            </span>
            <h1 className="mt-2 text-[30px] font-bold leading-tight text-[#2d3245]">
              {sectionData.title}
            </h1>
            <p className="mt-2 max-w-[760px] text-[15px] leading-6 text-[#697080]">
              {sectionData.description}
            </p>
          </div>
          <Link
            className="inline-flex h-10 items-center justify-center bg-[#b00632] px-5 text-[14px] font-bold text-white transition-colors hover:bg-[#8f0529]"
            href="/admin"
          >
            Dashboard
          </Link>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
          {sectionData.metrics.map((metric) => (
            <MetricCard key={metric.label} {...metric} />
          ))}
        </div>
      </div>

      {sectionData.crud.allowCreate ? (
        <details
          className="mt-5 border border-[#dfe6f2] bg-white shadow-[0_5px_18px_rgba(31,42,68,0.08)]"
          open={isArticleSection}
        >
          <summary className="cursor-pointer border-b border-[#e6edf6] px-5 py-4 text-[18px] font-bold text-[#2d3245]">
            {isArticleSection ? "Đăng bài viết" : `Thêm ${sectionData.crud.entityLabel}`}
          </summary>
          <form action="/api/admin/crud" className="p-5" method="post">
            <AdminCrudHiddenFields intent="create" sectionData={sectionData} />
            <AdminCrudFields fields={sectionData.crud.createFields} />
            <button
              className="mt-4 h-10 bg-[#00a987] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#008f72]"
              type="submit"
            >
              {isArticleSection ? "Đăng bài" : "Thêm mới"}
            </button>
          </form>
        </details>
      ) : null}

      <div className="mt-5 border border-[#dfe6f2] bg-white shadow-[0_5px_18px_rgba(31,42,68,0.08)]">
        <div className="flex flex-col gap-2 border-b border-[#e6edf6] px-5 py-4 md:flex-row md:items-center md:justify-between">
          <h2 className="text-[22px] font-bold leading-tight text-[#2d3245]">
            {isArticleSection ? "Bài đã đăng" : `Quản lý ${sectionData.crud.entityLabel}`}
          </h2>
          <span className="text-[13px] font-bold text-[#7b8394]">
            {pagination.startItem}-{pagination.endItem} / {pagination.totalItems}
          </span>
        </div>
        {sectionData.crud.rows.length ? (
          <div className="divide-y divide-[#edf1f7]">
            {sectionData.crud.rows.map((item, index) => (
              <details id={`section-item-${index + 1}`} key={`${item.id}-${item.title}-${index}`}>
                <summary className="grid cursor-pointer gap-2 px-5 py-4 transition-colors hover:bg-[#f8fafc] lg:grid-cols-[minmax(0,1fr)_220px] lg:items-center">
                  <span className="min-w-0">
                    <span className="block text-[17px] font-bold leading-6 text-[#263047]">
                      {item.title || "Không có tiêu đề"}
                    </span>
                    <span className="mt-1 line-clamp-2 block text-[14px] leading-6 text-[#697080]">
                      {item.description || "Không có mô tả."}
                    </span>
                  </span>
                  <span className="text-[13px] font-bold leading-5 text-[#8a91a2] lg:text-right">
                    {item.meta || "SQLite"}
                  </span>
                </summary>
                <div className="border-t border-[#edf1f7] bg-[#fbfcfe] px-5 py-5">
                  {sectionData.crud.allowUpdate ? (
                    <form action="/api/admin/crud" method="post">
                      <AdminCrudHiddenFields
                        id={item.id}
                        intent="update"
                        sectionData={sectionData}
                      />
                      <AdminCrudFields fields={item.fields} />
                      <div className="mt-4 flex flex-wrap gap-3">
                        <button
                          className="h-10 bg-[#b00632] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#8f0529]"
                          type="submit"
                        >
                          Lưu
                        </button>
                        {item.href ? (
                          <Link
                            className="inline-flex h-10 items-center border border-[#d7dfeb] px-5 text-[14px] font-bold text-[#51596b] transition-colors hover:border-[#b00632] hover:text-[#b00632]"
                            href={item.href}
                          >
                            Xem
                          </Link>
                        ) : null}
                      </div>
                    </form>
                  ) : null}
                  {sectionData.crud.allowDelete ? (
                    <form action="/api/admin/crud" className="mt-3" method="post">
                      <AdminCrudHiddenFields
                        id={item.id}
                        intent="delete"
                        sectionData={sectionData}
                      />
                      <button
                        className="h-10 border border-[#d82353] px-5 text-[14px] font-bold text-[#d82353] transition-colors hover:bg-[#d82353] hover:text-white"
                        type="submit"
                      >
                        Xoá
                      </button>
                    </form>
                  ) : null}
                </div>
              </details>
            ))}
          </div>
        ) : (
          <p className="px-5 py-6 text-[14px] leading-6 text-[#737b8c]">
            {sectionData.emptyMessage}
          </p>
        )}
        <AdminPagination sectionData={sectionData} />
      </div>
    </section>
  );
}

function AdminCrudHiddenFields({
  id = "",
  intent,
  sectionData,
}: {
  id?: string;
  intent: "create" | "delete" | "update";
  sectionData: AdminSectionData;
}) {
  return (
    <>
      <input name="entity" type="hidden" value={sectionData.crud.entity} />
      <input name="id" type="hidden" value={id} />
      <input name="intent" type="hidden" value={intent} />
      <input name="page" type="hidden" value={sectionData.crud.pagination.currentPage} />
      <input name="perPage" type="hidden" value={sectionData.crud.pagination.perPage} />
      <input name="sectionSlug" type="hidden" value={sectionData.slug} />
    </>
  );
}

function AdminCrudFields({ fields }: { fields: AdminSectionData["crud"]["createFields"] }) {
  const fieldIdPrefix = useId();
  const [customSelectFields, setCustomSelectFields] = useState<Record<string, boolean>>(() =>
    Object.fromEntries(
      fields
        .filter((field) => field.type === "select")
        .map((field) => {
          const options = selectOptionsForField(field);

          return [
            field.name,
            Boolean(field.allowCustom && field.value && !options.includes(field.value)),
          ];
        }),
    ),
  );

  return (
    <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
      {fields.map((field, index) => {
        const suggestionsId = `${fieldIdPrefix}-${field.name}-${index}`;
        const options = selectOptionsForField(field);
        const isCustomSelect = field.type === "select" && customSelectFields[field.name];
        const selectDefaultValue = isCustomSelect
          ? customSelectValue
          : field.value || options[0] || "";

        if (field.type === "checkbox") {
          return (
            <label
              className="flex min-h-11 items-center gap-3 border border-[#d7dfeb] bg-white px-3 text-[15px] font-bold text-[#51596b] md:col-span-2"
              key={field.name}
            >
              <input
                className="size-4 accent-[#b00632]"
                defaultChecked={field.value === "1"}
                name={field.name}
                type="checkbox"
                value="1"
              />
              <span>{field.label}</span>
            </label>
          );
        }

        if (field.type === "select" && field.categoryGroups?.length) {
          return <AdminCategoryField field={field} key={field.name} />;
        }

        if (field.name === "contentHtml" || field.type === "richtext") {
          return <AdminRichTextEditor field={field} key={field.name} />;
        }

        return (
          <label
            className={cn("block min-w-0", field.type === "textarea" ? "md:col-span-2" : "")}
            key={field.name}
          >
            <span className="mb-2 block text-[14px] font-bold text-[#51596b]">
              {field.label}
            </span>
            {field.type === "textarea" ? (
              <textarea
                className={cn(
                  "min-h-[104px] w-full border border-[#d7dfeb] bg-white px-3 py-2 text-[15px] outline-none focus:border-[#b00632]",
                  field.name === "contentHtml" ? "min-h-[220px]" : "",
                )}
                defaultValue={field.value}
                name={field.name}
                required={field.required}
              />
            ) : field.type === "select" ? (
              <>
                <select
                  className="h-11 w-full border border-[#d7dfeb] bg-white px-3 text-[15px] outline-none focus:border-[#b00632]"
                  defaultValue={selectDefaultValue}
                  name={isCustomSelect ? undefined : field.name}
                  onChange={(event) =>
                    setCustomSelectFields((current) => ({
                      ...current,
                      [field.name]: event.target.value === customSelectValue,
                    }))
                  }
                  required={field.required}
                >
                  {options.map((option) => (
                    <option key={option} value={option}>
                      {option}
                    </option>
                  ))}
                  {field.allowCustom ? (
                    <option value={customSelectValue}>Tạo chuyên mục mới</option>
                  ) : null}
                </select>
                {isCustomSelect ? (
                  <input
                    className="mt-3 h-11 w-full border border-[#d7dfeb] bg-white px-3 text-[15px] outline-none focus:border-[#b00632]"
                    defaultValue={options.includes(field.value) ? "" : field.value}
                    name={field.name}
                    placeholder="Nhập tên chuyên mục mới"
                    required={field.required}
                    type="text"
                  />
                ) : null}
              </>
            ) : (
              <input
                className="h-11 w-full border border-[#d7dfeb] bg-white px-3 text-[15px] outline-none focus:border-[#b00632]"
                defaultValue={field.value}
                list={field.suggestions?.length ? suggestionsId : undefined}
                name={field.name}
                required={field.required}
                type={field.type}
              />
            )}
            {field.type !== "select" && field.suggestions?.length ? (
              <datalist id={suggestionsId}>
                {field.suggestions.map((suggestion) => (
                  <option key={suggestion} value={suggestion} />
                ))}
              </datalist>
            ) : null}
          </label>
        );
      })}
    </div>
  );
}

function AdminRichTextEditor({
  field,
}: {
  field: AdminSectionData["crud"]["createFields"][number];
}) {
  const editorRef = useRef<HTMLDivElement>(null);
  const hiddenInputRef = useRef<HTMLInputElement>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const savedSelectionRef = useRef<Range | null>(null);
  const initialEditorHtml = field.value || "<p><br></p>";
  const [html, setHtml] = useState(field.value);
  const [activeCommands, setActiveCommands] = useState({
    bold: false,
    italic: false,
    orderedList: false,
    unorderedList: false,
  });
  const [currentBlock, setCurrentBlock] = useState<EditorBlock>("p");
  const [editorMessage, setEditorMessage] = useState("");
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const syncHtml = useCallback(() => {
    if (hiddenInputRef.current && editorRef.current) {
      const nextHtml = editorRef.current.innerHTML;

      hiddenInputRef.current.value = nextHtml;
      setHtml(nextHtml);
    }
  }, []);
  const updateToolbarState = useCallback(() => {
    const editor = editorRef.current;
    const selection = window.getSelection();
    const anchorNode = selection?.anchorNode ?? null;

    if (!editor || !anchorNode || !editor.contains(anchorNode)) {
      return;
    }

    if (selection?.rangeCount) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }

    setCurrentBlock(editorBlockForSelection(editor, anchorNode));
    setActiveCommands({
      bold: editorSelectionHasAncestor(editor, anchorNode, ["b", "strong"]),
      italic: editorSelectionHasAncestor(editor, anchorNode, ["em", "i"]),
      orderedList: editorSelectionHasAncestor(editor, anchorNode, ["ol"]),
      unorderedList: editorSelectionHasAncestor(editor, anchorNode, ["ul"]),
    });
  }, []);

  useEffect(() => {
    const editor = editorRef.current;
    const form = editor?.closest("form");

    if (!editor) {
      return;
    }

    if (!editor.innerHTML.trim()) {
      editor.innerHTML = initialEditorHtml;
    }

    const syncEditorState = () => {
      syncHtml();
      updateToolbarState();
    };
    const syncAfterPaste = () => window.requestAnimationFrame(syncEditorState);

    syncEditorState();
    document.addEventListener("selectionchange", updateToolbarState);
    editor.addEventListener("click", updateToolbarState);
    editor.addEventListener("focus", updateToolbarState);
    editor.addEventListener("input", syncEditorState);
    editor.addEventListener("keyup", syncEditorState);
    editor.addEventListener("blur", syncHtml);
    editor.addEventListener("paste", syncAfterPaste);
    form?.addEventListener("submit", syncHtml, true);

    return () => {
      document.removeEventListener("selectionchange", updateToolbarState);
      editor.removeEventListener("click", updateToolbarState);
      editor.removeEventListener("focus", updateToolbarState);
      editor.removeEventListener("input", syncEditorState);
      editor.removeEventListener("keyup", syncEditorState);
      editor.removeEventListener("blur", syncHtml);
      editor.removeEventListener("paste", syncAfterPaste);
      form?.removeEventListener("submit", syncHtml, true);
    };
  }, [initialEditorHtml, syncHtml, updateToolbarState]);

  const restoreEditorSelection = () => {
    const editor = editorRef.current;
    const selection = window.getSelection();

    if (!editor || !selection) {
      return;
    }

    editor.focus();
    selection.removeAllRanges();

    if (
      savedSelectionRef.current &&
      editor.contains(savedSelectionRef.current.commonAncestorContainer)
    ) {
      selection.addRange(savedSelectionRef.current);
      return;
    }

    const range = document.createRange();

    range.selectNodeContents(editor);
    range.collapse(false);
    selection.addRange(range);
  };
  const runCommand = (command: string, value?: string) => {
    editorRef.current?.focus();
    document.execCommand(command, false, value);
    syncHtml();
    updateToolbarState();
  };
  const insertHtml = (html: string) => {
    restoreEditorSelection();
    document.execCommand("insertHTML", false, html);
    syncHtml();
    updateToolbarState();
  };
  const insertLink = () => {
    const rawHref = window.prompt("URL");

    if (!rawHref?.trim()) {
      return;
    }

    const href = normalizeEditorHref(rawHref);

    runCommand("createLink", href);
  };
  const insertTable = () => {
    insertHtml(
      '<table><tbody><tr><td>Nội dung</td><td>Nội dung</td></tr><tr><td>Nội dung</td><td>Nội dung</td></tr></tbody></table><p><br></p>',
    );
  };
  const insertTableOfContents = () => {
    const editor = editorRef.current;

    if (!editor) {
      return;
    }

    const tocHtml = tableOfContentsHtml(editor);

    if (!tocHtml) {
      setEditorMessage("Hãy đặt các mục chính trong bài thành Heading 2 hoặc Heading 3 trước.");
      return;
    }

    insertHtml(tocHtml);
    setEditorMessage("Đã chèn mục lục.");
  };
  const chooseImage = () => {
    const selection = window.getSelection();

    if (selection?.rangeCount) {
      savedSelectionRef.current = selection.getRangeAt(0).cloneRange();
    }

    imageInputRef.current?.click();
  };
  const uploadAndInsertImage = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];

    event.target.value = "";

    if (!file) {
      return;
    }

    setEditorMessage("");
    setIsUploadingImage(true);

    try {
      const caption = window.prompt("Ghi chú dưới ảnh (bỏ trống nếu không cần)", "") ?? "";
      const formData = new FormData();

      formData.append("image", file);

      const response = await fetch("/api/admin/upload", {
        body: formData,
        method: "POST",
      });
      const payload = (await response.json()) as AdminImageUploadResponse;

      if (!response.ok || !payload.url) {
        throw new Error(payload.message || "Không thể tải ảnh lên.");
      }

      insertHtml(editorImageHtml(payload.url, file.name, caption));
      setEditorMessage("Đã chèn ảnh.");
    } catch (error) {
      setEditorMessage(
        error instanceof Error ? error.message : "Không thể tải ảnh lên.",
      );
    } finally {
      setIsUploadingImage(false);
    }
  };
  const toolbarButtonClass =
    "flex size-9 items-center justify-center border-r border-[#d7dfeb] text-[#4f5868] transition-colors hover:bg-[#eef2f8] hover:text-[#b00632]";

  return (
    <div
      className={cn(
        "md:col-span-2",
        isExpanded
          ? "fixed inset-4 z-[1300] flex flex-col bg-white p-4 shadow-[0_20px_70px_rgba(21,32,55,0.35)]"
          : "",
      )}
    >
      <input
        name={field.name}
        readOnly
        ref={hiddenInputRef}
        type="hidden"
        value={html}
      />
      <input
        accept="image/jpeg,image/png,image/webp,image/gif"
        className="hidden"
        onChange={uploadAndInsertImage}
        ref={imageInputRef}
        type="file"
      />
      <div className="mb-2 block text-[14px] font-bold text-[#51596b]">{field.label}</div>
      <div className="border border-[#cfd8e6] bg-white">
        <div className="flex min-h-11 flex-wrap items-center border-b border-[#cfd8e6] bg-[#f8fafc]">
          <select
            aria-label="Định dạng đoạn"
            className="mx-2 h-8 min-w-[132px] border border-[#d7dfeb] bg-white px-2 text-[14px] text-[#4f5868] outline-none focus:border-[#b00632]"
            onChange={(event) => runCommand("formatBlock", event.target.value)}
            value={currentBlock}
          >
            {editorBlockOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </select>
          <EditorToolbarButton
            active={activeCommands.bold}
            className={toolbarButtonClass}
            icon={Bold}
            label="Bold"
            onClick={() => runCommand("bold")}
          />
          <EditorToolbarButton
            active={activeCommands.italic}
            className={toolbarButtonClass}
            icon={Italic}
            label="Italic"
            onClick={() => runCommand("italic")}
          />
          <EditorToolbarButton
            active={activeCommands.unorderedList}
            className={toolbarButtonClass}
            icon={List}
            label="Bulleted list"
            onClick={() => runCommand("insertUnorderedList")}
          />
          <EditorToolbarButton
            active={activeCommands.orderedList}
            className={toolbarButtonClass}
            icon={ListOrdered}
            label="Numbered list"
            onClick={() => runCommand("insertOrderedList")}
          />
          <EditorToolbarButton
            className="flex h-9 items-center justify-center gap-1.5 border-r border-[#d7dfeb] px-2.5 text-[13px] font-bold text-[#4f5868] transition-colors hover:bg-[#eef2f8] hover:text-[#b00632]"
            icon={TableOfContents}
            label="Chèn mục lục"
            onClick={insertTableOfContents}
            text="Mục lục"
          />
          <EditorToolbarButton
            active={currentBlock === "blockquote"}
            className={toolbarButtonClass}
            icon={Quote}
            label="Quote"
            onClick={() => runCommand("formatBlock", "blockquote")}
          />
          <EditorToolbarButton
            className={toolbarButtonClass}
            icon={AlignLeft}
            label="Align left"
            onClick={() => runCommand("justifyLeft")}
          />
          <EditorToolbarButton
            className={toolbarButtonClass}
            icon={AlignCenter}
            label="Align center"
            onClick={() => runCommand("justifyCenter")}
          />
          <EditorToolbarButton
            className={toolbarButtonClass}
            icon={AlignRight}
            label="Align right"
            onClick={() => runCommand("justifyRight")}
          />
          <EditorToolbarButton
            className={toolbarButtonClass}
            icon={Link2}
            label="Insert link"
            onClick={insertLink}
          />
          <EditorToolbarButton
            className={toolbarButtonClass}
            icon={Unlink}
            label="Remove link"
            onClick={() => runCommand("unlink")}
          />
          <EditorToolbarButton
            className={toolbarButtonClass}
            disabled={isUploadingImage}
            icon={ImageIcon}
            label={isUploadingImage ? "Đang tải ảnh" : "Insert image"}
            onClick={chooseImage}
          />
          <EditorToolbarButton
            className={toolbarButtonClass}
            icon={Table2}
            label="Insert table"
            onClick={insertTable}
          />
          <EditorToolbarButton
            className="ml-auto flex size-9 items-center justify-center text-[#4f5868] transition-colors hover:bg-[#eef2f8] hover:text-[#b00632]"
            icon={isExpanded ? Minimize2 : Maximize2}
            label={isExpanded ? "Thu nhỏ" : "Mở rộng"}
            onClick={() => setIsExpanded((current) => !current)}
          />
        </div>
        {editorMessage ? (
          <div className="border-b border-[#e5ebf3] bg-[#fbfcfe] px-4 py-2 text-[13px] font-semibold text-[#596274]">
            {editorMessage}
          </div>
        ) : null}
        <div
          className={cn(
            "iaa-article-content min-h-[320px] bg-white px-5 py-4 text-[16px] leading-[25.6px] text-black outline-none focus:ring-2 focus:ring-inset focus:ring-[#b00632]/25",
            isExpanded ? "min-h-0 flex-1 overflow-y-auto" : "",
          )}
          contentEditable
          onBlur={syncHtml}
          onInput={syncHtml}
          ref={editorRef}
          role="textbox"
          suppressContentEditableWarning
          suppressHydrationWarning
        />
      </div>
    </div>
  );
}

function EditorToolbarButton({
  active = false,
  className,
  disabled = false,
  icon: Icon,
  label,
  onClick,
  text,
}: {
  active?: boolean;
  className: string;
  disabled?: boolean;
  icon: LucideIcon;
  label: string;
  onClick: () => void;
  text?: string;
}) {
  return (
    <button
      aria-label={label}
      className={cn(
        className,
        active ? "bg-[#e9eff7] text-[#b00632]" : "",
        disabled ? "cursor-not-allowed opacity-55" : "",
      )}
      disabled={disabled}
      onMouseDown={(event) => {
        event.preventDefault();
        if (disabled) {
          return;
        }
        onClick();
      }}
      title={label}
      type="button"
    >
      <Icon className="size-[18px]" strokeWidth={2.4} />
      {text ? <span className="whitespace-nowrap">{text}</span> : null}
    </button>
  );
}

function editorBlockForSelection(editor: HTMLDivElement, anchorNode: Node): EditorBlock {
  let currentNode: Node | null =
    anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentNode;
  let nearestBlock: EditorBlock | null = null;

  while (currentNode && currentNode !== editor) {
    if (currentNode instanceof HTMLElement) {
      const tagName = currentNode.tagName.toLowerCase();
      const blockOption = editorBlockOptions.find((option) => option.value === tagName);

      if (blockOption?.value === "blockquote") {
        return blockOption.value;
      }

      if (blockOption && !nearestBlock) {
        nearestBlock = blockOption.value;
      }
    }

    currentNode = currentNode.parentNode;
  }

  return nearestBlock ?? "p";
}

function editorSelectionHasAncestor(
  editor: HTMLDivElement,
  anchorNode: Node,
  tagNames: string[],
) {
  let currentNode: Node | null =
    anchorNode.nodeType === Node.ELEMENT_NODE ? anchorNode : anchorNode.parentNode;

  while (currentNode && currentNode !== editor) {
    if (
      currentNode instanceof HTMLElement &&
      tagNames.includes(currentNode.tagName.toLowerCase())
    ) {
      return true;
    }

    currentNode = currentNode.parentNode;
  }

  return false;
}

type EditorTocItem = {
  children: EditorTocItem[];
  id: string;
  level: 2 | 3;
  title: string;
};

function tableOfContentsHtml(editor: HTMLDivElement) {
  const headings = Array.from(editor.querySelectorAll<HTMLHeadingElement>("h2, h3")).filter(
    (heading) => heading.textContent?.trim() && !heading.closest("#ftwp-container-outer"),
  );

  if (!headings.length) {
    return "";
  }

  const usedIds = new Set(
    Array.from(editor.querySelectorAll<HTMLElement>("[id]"))
      .filter((element) => !headings.includes(element as HTMLHeadingElement))
      .map((element) => element.id),
  );
  const items: EditorTocItem[] = [];
  let currentParent: EditorTocItem | null = null;

  headings.forEach((heading, index) => {
    const title = heading.textContent?.trim() ?? "";
    const level = heading.tagName.toLowerCase() === "h3" ? 3 : 2;
    const id =
      heading.id.trim() || uniqueEditorId(editorSlugFromText(title) || `muc-${index + 1}`, usedIds);
    const item: EditorTocItem = {
      children: [],
      id,
      level,
      title,
    };

    heading.id = id;
    usedIds.add(id);

    if (level === 3 && currentParent) {
      currentParent.children.push(item);
      return;
    }

    items.push(item);
    currentParent = item;
  });

  return `<div id="ftwp-container-outer" class="ftwp-in-post ftwp-float-none"><div id="ftwp-contents"><header id="ftwp-header"><h2 id="ftwp-header-title">Mục Lục</h2></header>${editorTocListHtml(
    items,
  )}</div></div><p><br></p>`;
}

function editorTocListHtml(items: EditorTocItem[]): string {
  return `<ol>${items.map(editorTocItemHtml).join("")}</ol>`;
}

function editorTocItemHtml(item: EditorTocItem): string {
  const childList: string = item.children.length ? editorTocListHtml(item.children) : "";

  return `<li><a href="#${escapeEditorAttribute(item.id)}">${escapeEditorText(
    item.title,
  )}</a>${childList}</li>`;
}

function uniqueEditorId(baseId: string, usedIds: Set<string>) {
  let nextId = baseId;
  let index = 2;

  while (usedIds.has(nextId)) {
    nextId = `${baseId}-${index}`;
    index += 1;
  }

  return nextId;
}

function editorSlugFromText(value: string) {
  return value
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/đ/g, "d")
    .replace(/Đ/g, "d")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function editorImageHtml(src: string, alt: string, caption = "") {
  const imageHtml = `<img class="size-full" src="${escapeEditorAttribute(
    src,
  )}" alt="${escapeEditorAttribute(imageAltFromFilename(alt))}" />`;
  const trimmedCaption = caption.trim();

  if (trimmedCaption) {
    return `<figure class="wp-caption aligncenter">${imageHtml}<figcaption class="wp-caption-text">${escapeEditorText(
      trimmedCaption,
    )}</figcaption></figure><p><br></p>`;
  }

  return `<p><img class="aligncenter size-full" src="${escapeEditorAttribute(src)}" alt="${escapeEditorAttribute(
    imageAltFromFilename(alt),
  )}" /></p><p><br></p>`;
}

function imageAltFromFilename(filename: string) {
  return filename
    .replace(/\.[a-z0-9]+$/i, "")
    .replace(/[-_]+/g, " ")
    .trim();
}

function escapeEditorAttribute(value: string) {
  return value
    .replace(/&/g, "&amp;")
    .replace(/"/g, "&quot;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");
}

function escapeEditorText(value: string) {
  return value.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
}

function normalizeEditorHref(value: string) {
  const href = value.trim();

  if (href.startsWith("/") || /^[a-z][a-z0-9+.-]*:/i.test(href)) {
    return href;
  }

  return `https://${href}`;
}

function AdminCategoryField({
  field,
}: {
  field: AdminSectionData["crud"]["createFields"][number];
}) {
  const groups = field.categoryGroups ?? [];
  const initialGroupValue = categoryGroupValueForField(field);
  const initialGroup = groups.find((group) => group.value === initialGroupValue) ?? groups[0];
  const hasInitialOption = Boolean(
    initialGroup?.children.some((option) => option.value === field.value),
  );
  const [selectedGroupValue, setSelectedGroupValue] = useState(initialGroup?.value ?? "");
  const [selectedCategoryValue, setSelectedCategoryValue] = useState(
    hasInitialOption ? field.value : initialGroup?.children[0]?.value ?? "",
  );
  const [isCustomCategory, setIsCustomCategory] = useState(
    Boolean(field.allowCustom && field.value && !hasInitialOption),
  );
  const selectedGroup = groups.find((group) => group.value === selectedGroupValue) ?? groups[0];
  const childOptions = selectedGroup?.children ?? [];

  return (
    <>
      <label className="block min-w-0">
        <span className="mb-2 block text-[14px] font-bold text-[#51596b]">
          Chuyên mục lớn
        </span>
        <select
          className="h-11 w-full border border-[#d7dfeb] bg-white px-3 text-[15px] outline-none focus:border-[#b00632]"
          onChange={(event) => {
            const nextGroup = groups.find((group) => group.value === event.target.value);

            setSelectedGroupValue(event.target.value);
            setSelectedCategoryValue(nextGroup?.children[0]?.value ?? "");
            setIsCustomCategory(false);
          }}
          value={selectedGroupValue}
        >
          {groups.map((group) => (
            <option key={group.value} value={group.value}>
              {group.label}
            </option>
          ))}
        </select>
      </label>

      <label className="block min-w-0">
        <span className="mb-2 block text-[14px] font-bold text-[#51596b]">
          Chuyên mục nhỏ
        </span>
        <select
          className="h-11 w-full border border-[#d7dfeb] bg-white px-3 text-[15px] outline-none focus:border-[#b00632]"
          name={isCustomCategory ? undefined : field.name}
          onChange={(event) => {
            const isCustom = event.target.value === customSelectValue;

            setIsCustomCategory(isCustom);
            if (!isCustom) {
              setSelectedCategoryValue(event.target.value);
            }
          }}
          required={field.required}
          value={isCustomCategory ? customSelectValue : selectedCategoryValue}
        >
          {childOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
          {field.allowCustom ? (
            <option value={customSelectValue}>Tạo chuyên mục mới</option>
          ) : null}
        </select>
        {isCustomCategory ? (
          <input
            className="mt-3 h-11 w-full border border-[#d7dfeb] bg-white px-3 text-[15px] outline-none focus:border-[#b00632]"
            defaultValue={hasInitialOption ? "" : field.value}
            name={field.name}
            placeholder="Nhập tên chuyên mục mới"
            required={field.required}
            type="text"
          />
        ) : null}
      </label>
    </>
  );
}

function categoryGroupValueForField(field: AdminSectionData["crud"]["createFields"][number]) {
  const groups = field.categoryGroups ?? [];
  const matchingGroup = groups.find(
    (group) =>
      group.value === field.value ||
      group.children.some((option) => option.value === field.value),
  );

  return matchingGroup?.value ?? groups[0]?.value ?? "";
}

function selectOptionsForField(field: AdminSectionData["crud"]["createFields"][number]) {
  return [
    ...new Set(
      [...(field.suggestions ?? []), field.value]
        .map((value) => value.trim())
        .filter(Boolean),
    ),
  ];
}

function AdminPagination({ sectionData }: { sectionData: AdminSectionData }) {
  const pagination = sectionData.crud.pagination;
  const basePath = `/admin/${sectionData.slug}`;
  const previousPage = Math.max(1, pagination.currentPage - 1);
  const nextPage = Math.min(pagination.totalPages, pagination.currentPage + 1);

  return (
    <div className="flex flex-col gap-3 border-t border-[#e6edf6] px-5 py-4 md:flex-row md:items-center md:justify-between">
      <div className="text-[13px] font-bold text-[#7b8394]">
        Trang {pagination.currentPage} / {pagination.totalPages}
      </div>
      <form action={basePath} className="flex flex-wrap items-center gap-2" method="get">
        <input name="page" type="hidden" value="1" />
        <select
          className="h-10 border border-[#d7dfeb] bg-white px-3 text-[14px] font-bold text-[#51596b] outline-none"
          defaultValue={pagination.perPage}
          name="perPage"
        >
          {[5, 10, 20, 30, 50].map((option) => (
            <option key={option} value={option}>
              {option} dòng
            </option>
          ))}
        </select>
        <button
          className="h-10 border border-[#d7dfeb] px-4 text-[14px] font-bold text-[#51596b] transition-colors hover:border-[#b00632] hover:text-[#b00632]"
          type="submit"
        >
          Áp dụng
        </button>
      </form>
      <div className="flex gap-2">
        <Link
          aria-disabled={pagination.currentPage <= 1}
          className={cn(
            "inline-flex h-10 items-center border px-4 text-[14px] font-bold transition-colors",
            pagination.currentPage <= 1
              ? "pointer-events-none border-[#e2e8f0] text-[#b8bfcc]"
              : "border-[#d7dfeb] text-[#51596b] hover:border-[#b00632] hover:text-[#b00632]",
          )}
          href={`${basePath}?page=${previousPage}&perPage=${pagination.perPage}`}
        >
          Trước
        </Link>
        <Link
          aria-disabled={pagination.currentPage >= pagination.totalPages}
          className={cn(
            "inline-flex h-10 items-center border px-4 text-[14px] font-bold transition-colors",
            pagination.currentPage >= pagination.totalPages
              ? "pointer-events-none border-[#e2e8f0] text-[#b8bfcc]"
              : "border-[#d7dfeb] text-[#51596b] hover:border-[#b00632] hover:text-[#b00632]",
          )}
          href={`${basePath}?page=${nextPage}&perPage=${pagination.perPage}`}
        >
          Sau
        </Link>
      </div>
    </div>
  );
}

function AdminDataPanels({ dashboardData }: { dashboardData: AdminDashboardData }) {
  return (
    <section className="mt-8 grid grid-cols-1 gap-5 xl:grid-cols-2">
      <div className="grid grid-cols-1 gap-5">
        <div
          className="border border-[#dfe6f2] bg-white p-5 shadow-[0_5px_18px_rgba(31,42,68,0.08)]"
          id="admin-users"
        >
          <h2 className="mb-4 text-[22px] font-bold leading-tight text-[#2d3245]">Tài khoản</h2>
          <div className="space-y-3">
            {dashboardData.users.map((user) => (
              <div
                className="grid grid-cols-[1fr_auto] gap-3 border border-[#e3e9f2] px-4 py-3"
                key={user.username}
              >
                <div>
                  <div className="text-[16px] font-bold text-[#263047]">{user.username}</div>
                  <div className="text-[13px] text-[#7b8394]">{user.role}</div>
                </div>
                <div className="text-right text-[12px] leading-5 text-[#7b8394]">
                  {formatDateTime(user.lastLoginAt) || "Chưa đăng nhập"}
                </div>
              </div>
            ))}
          </div>
        </div>

        <form
          action="/api/admin/password"
          className="border border-[#dfe6f2] bg-white p-5 shadow-[0_5px_18px_rgba(31,42,68,0.08)]"
          id="change-password"
          method="post"
        >
          <h2 className="mb-4 text-[22px] font-bold leading-tight text-[#2d3245]">Đổi mật khẩu</h2>
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <AdminInput label="Mật khẩu hiện tại" name="currentPassword" type="password" />
            <AdminInput label="Mật khẩu mới" name="nextPassword" type="password" />
          </div>
          <button
            className="mt-4 h-10 bg-[#009552] px-6 text-[15px] font-bold text-white transition-colors hover:bg-[#007d45]"
            type="submit"
          >
            Cập nhật mật khẩu
          </button>
        </form>
      </div>

      <div
        className="border border-[#dfe6f2] bg-white p-5 shadow-[0_5px_18px_rgba(31,42,68,0.08)]"
        id="contact-messages"
      >
        <h2 className="mb-4 text-[22px] font-bold leading-tight text-[#2d3245]">Thư liên hệ</h2>
        {dashboardData.messages.length ? (
          <div className="space-y-3">
            {dashboardData.messages.map((message) => (
              <article className="border border-[#e3e9f2] px-4 py-3" key={message.id}>
                <div className="flex flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
                  <h3 className="text-[16px] font-bold text-[#263047]">{message.name}</h3>
                  <span className="text-[12px] text-[#7b8394]">
                    {formatDateTime(message.createdAt)}
                  </span>
                </div>
                <div className="mt-1 text-[13px] font-bold text-[#b00632]">{message.email}</div>
                <p className="mt-2 text-[14px] leading-6 text-[#646b7a]">
                  {message.message || "Không có nội dung."}
                </p>
              </article>
            ))}
          </div>
        ) : (
          <p className="text-[14px] leading-6 text-[#737b8c]">
            Chưa có thư nào. Form `/lien-he` sẽ ghi tin nhắn vào SQLite.
          </p>
        )}
      </div>

      <div className="border border-[#dfe6f2] bg-white p-5 shadow-[0_5px_18px_rgba(31,42,68,0.08)]">
        <h2 className="mb-4 text-[22px] font-bold leading-tight text-[#2d3245]">Bài viết mới</h2>
        <div className="space-y-3">
          {dashboardData.recentArticles.map((article) => (
            <Link
              className="block border border-[#e3e9f2] px-4 py-3 transition-colors hover:border-[#b00632]"
              href={article.href}
              key={article.href}
            >
              <span className="block text-[12px] font-black uppercase leading-none text-[#b00632]">
                {article.category}
              </span>
              <span className="mt-2 block text-[16px] font-bold leading-5 text-[#263047]">
                {article.title}
              </span>
              <span className="mt-1 block text-[12px] text-[#7b8394]">
                {formatDateTime(article.publishedAt)}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

function AdminInput({
  defaultValue = "",
  label,
  name,
  type = "text",
}: {
  defaultValue?: string;
  label: string;
  name: string;
  type?: string;
}) {
  return (
    <label className="block min-w-0">
      <span className="mb-2 block text-[14px] font-bold text-[#51596b]">{label}</span>
      <input
        className="h-11 w-full border border-[#d7dfeb] px-3 text-[15px] outline-none focus:border-[#b00632]"
        defaultValue={defaultValue}
        name={name}
        required
        type={type}
      />
    </label>
  );
}

function AdminTopBar({
  notificationCount,
  onLogout,
  searchQuery,
}: {
  notificationCount: number;
  onLogout: () => void;
  searchQuery: string;
}) {
  return (
    <div className="grid min-h-[72px] grid-cols-1 gap-3 border border-[#dfe6f2] bg-white p-3 shadow-[0_5px_18px_rgba(31,42,68,0.08)] lg:grid-cols-[1fr_auto] lg:items-center">
      <div className="flex min-w-0 flex-col gap-3 sm:flex-row sm:items-center">
        <div className="flex items-center gap-2 whitespace-nowrap text-[16px] font-bold text-[#293045]">
          <Moon className="size-5 text-[#ca8b02]" strokeWidth={2.2} />
          Xin chào: Administrator
        </div>
        <form
          action="/admin"
          className="flex h-11 min-w-0 flex-1 items-center gap-3 border border-transparent px-2 text-[#6b7280]"
          method="get"
        >
          <Search className="size-7 shrink-0 text-[#1f2937]" strokeWidth={1.9} />
          <input
            aria-label="Search admin"
            className="min-w-0 flex-1 bg-transparent text-[16px] font-medium outline-none placeholder:text-[#687082]"
            defaultValue={searchQuery}
            name="q"
            placeholder="Tìm kiếm (Ctrl+/)"
            type="search"
          />
        </form>
      </div>
      <div className="flex flex-wrap items-center gap-2 text-[#6d7280]">
        <div className="hidden items-center gap-2 text-[#921139] sm:flex">
          <span className="flex size-8 items-center justify-center rounded-full border-2 border-current text-[12px] font-black">
            php
          </span>
          <span className="text-[15px] font-black uppercase">VERSION 8.3.31</span>
        </div>
        <IconButton ariaLabel="Undo" className="hidden sm:flex" icon={Undo2} />
        <IconButton ariaLabel="Theme" icon={Sun} />
        <IconButton ariaLabel="Apps" icon={Gauge} />
        <button
          aria-label="Notifications"
          className="relative flex size-10 items-center justify-center text-[#6d7280] transition-colors hover:text-[#b00632]"
          type="button"
        >
          <Bell className="size-6" strokeWidth={1.9} />
          <span className="absolute right-0 top-0 flex size-5 items-center justify-center rounded-full bg-[#d82353] text-[11px] font-bold leading-none text-white">
            {notificationCount}
          </span>
        </button>
        <IconButton ariaLabel="Account" icon={UserRound} />
        <IconButton ariaLabel="Logout" icon={LogOut} onClick={onLogout} />
      </div>
    </div>
  );
}

function IconButton({
  ariaLabel,
  className,
  icon: Icon,
  onClick,
}: {
  ariaLabel: string;
  className?: string;
  icon: LucideIcon;
  onClick?: () => void;
}) {
  return (
    <button
      aria-label={ariaLabel}
      className={cn(
        "flex size-10 items-center justify-center text-[#6d7280] transition-colors hover:text-[#b00632]",
        className,
      )}
      onClick={onClick}
      type="button"
    >
      <Icon className="size-6" strokeWidth={1.9} />
    </button>
  );
}

function ShortcutCard({
  card,
}: {
  card: AdminDashboardCard;
}) {
  const Icon = cardIcons[card.id];

  return (
    <Link
      className="grid min-h-[96px] grid-cols-[92px_1fr] items-center border border-[#dfe6f2] bg-white p-3 shadow-[0_4px_16px_rgba(31,42,68,0.06)] transition-transform hover:-translate-y-0.5"
      href={card.href}
    >
      <span
        className={cn(
          "flex size-[76px] items-center justify-center text-white",
          toneClass(card.tone),
        )}
      >
        <Icon className="size-10" strokeWidth={2.1} />
      </span>
      <span className="min-w-0">
        <span className="block text-[17px] font-medium leading-[22px] text-[#5c6373]">
          {card.title}
        </span>
        <span className="block text-[16px] font-black leading-[20px] text-[#202944]">
          {card.detail}
        </span>
      </span>
    </Link>
  );
}

function MetricCard({
  label,
  tone,
  value,
}: {
  label: string;
  tone: AdminMetric["tone"];
  value: number;
}) {
  return (
    <div className="flex min-h-[92px] items-center gap-4 border border-[#dfe6f2] bg-white px-6 shadow-[0_4px_16px_rgba(31,42,68,0.06)]">
      <BarChart3 className={cn("size-7 shrink-0", metricToneClass(tone))} strokeWidth={2.1} />
      <div>
        <div className="text-[19px] font-bold leading-[23px] text-[#526078]">
          {value.toLocaleString("vi-VN")}
        </div>
        <div className="text-[13px] leading-[18px] text-[#8a91a2]">{label}</div>
      </div>
    </div>
  );
}

function formatDateTime(value: string | null) {
  if (!value) {
    return "";
  }

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "";
  }

  return new Intl.DateTimeFormat("vi-VN", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(date);
}

function toneClass(tone: "green" | "pink" | "red") {
  if (tone === "green") {
    return "bg-[#009552]";
  }

  if (tone === "pink") {
    return "bg-[#eb285b]";
  }

  return "bg-[#b00632]";
}

function metricToneClass(tone: "green" | "pink" | "red" | "teal") {
  if (tone === "green") {
    return "text-[#00a987]";
  }

  if (tone === "teal") {
    return "text-[#13bfc0]";
  }

  if (tone === "pink") {
    return "text-[#ec3f70]";
  }

  return "text-[#c5103d]";
}
