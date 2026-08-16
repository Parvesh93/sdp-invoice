"use client";

import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

type RichTextEditorProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export default function RichTextEditor({
  value,
  onChange,
}: RichTextEditorProps) {
  const editor = useEditor({
    extensions: [
      StarterKit,
    ],

    content: value,

    immediatelyRender: false,

    onUpdate({ editor }) {
      onChange(editor.getHTML());
    },
  });

  if (!editor) {
    return (
      <div className="rounded-lg border border-slate-300 p-4 text-sm text-slate-500">
        Loading editor...
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-lg border border-slate-300 bg-white">
      {/* Toolbar */}
      <div className="flex flex-wrap gap-1 border-b border-slate-200 bg-slate-50 p-2">
        <ToolbarButton
          active={editor.isActive("bold")}
          onClick={() =>
            editor.chain().focus().toggleBold().run()
          }
        >
          Bold
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("italic")}
          onClick={() =>
            editor.chain().focus().toggleItalic().run()
          }
        >
          Italic
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("heading", {
            level: 2,
          })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 2,
              })
              .run()
          }
        >
          H2
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("heading", {
            level: 3,
          })}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleHeading({
                level: 3,
              })
              .run()
          }
        >
          H3
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("bulletList")}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleBulletList()
              .run()
          }
        >
          Bullets
        </ToolbarButton>

        <ToolbarButton
          active={editor.isActive("orderedList")}
          onClick={() =>
            editor
              .chain()
              .focus()
              .toggleOrderedList()
              .run()
          }
        >
          Numbered
        </ToolbarButton>

        <ToolbarButton
          active={false}
          onClick={() =>
            editor.chain().focus().undo().run()
          }
        >
          Undo
        </ToolbarButton>

        <ToolbarButton
          active={false}
          onClick={() =>
            editor.chain().focus().redo().run()
          }
        >
          Redo
        </ToolbarButton>
      </div>

      <EditorContent
        editor={editor}
        className="
          min-h-[280px]
          px-4
          py-3
          text-sm
          text-slate-800
          [&_.ProseMirror]:min-h-[250px]
          [&_.ProseMirror]:outline-none
          [&_.ProseMirror_h2]:mb-3
          [&_.ProseMirror_h2]:mt-4
          [&_.ProseMirror_h2]:text-xl
          [&_.ProseMirror_h2]:font-bold
          [&_.ProseMirror_h3]:mb-2
          [&_.ProseMirror_h3]:mt-4
          [&_.ProseMirror_h3]:text-lg
          [&_.ProseMirror_h3]:font-semibold
          [&_.ProseMirror_ul]:list-disc
          [&_.ProseMirror_ul]:pl-6
          [&_.ProseMirror_ol]:list-decimal
          [&_.ProseMirror_ol]:pl-6
          [&_.ProseMirror_p]:mb-2
        "
      />
    </div>
  );
}

function ToolbarButton({
  active,
  onClick,
  children,
}: {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-md px-3 py-1.5 text-xs font-medium transition ${
        active
          ? "bg-slate-900 text-white"
          : "bg-white text-slate-700 hover:bg-slate-200"
      }`}
    >
      {children}
    </button>
  );
}