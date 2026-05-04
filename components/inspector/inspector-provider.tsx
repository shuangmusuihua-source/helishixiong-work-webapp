'use client';

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useState,
  useEffect,
} from 'react';
import { Button } from '@/components/ui/button';
import { Crosshair, X } from 'lucide-react';

// 选中的元素
export type SelectedElement = {
  id: string;           // 元素唯一标识
  element: HTMLElement; // DOM 元素引用
  tagName: string;      // 标签名
  text: string | null;  // 文本内容
  styles: {             // 计算后的样式
    fontSize: number;
    fontWeight: number;
    fontStyle: 'normal' | 'italic';
    color: string;
    backgroundColor: string | null;
    textAlign: 'left' | 'center' | 'right' | 'justify';
    lineHeight: number | null;
  };
};

// 编辑操作
export type EditOp = {
  type: 'text' | 'style';
  key?: string;
  value: string | number;
};

// 编辑快照（用于撤销）
type EditSnapshot = {
  elementId: string;
  op: EditOp;
  previousValue: string | number;
};

// Context 类型
type InspectorCtx = {
  active: boolean;
  toggle: () => void;
  selected: SelectedElement | null;
  selectElement: (el: HTMLElement | null) => void;
  applyEdit: (op: EditOp) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  getEditedHtml: () => string;
};

const Ctx = createContext<InspectorCtx | null>(null);

export function useInspector(): InspectorCtx {
  const v = useContext(Ctx);
  if (!v) throw new Error('useInspector must be used inside <InspectorProvider>');
  return v;
}

// 生成唯一 ID
function generateElementId(el: HTMLElement, index: number): string {
  const tag = el.tagName.toLowerCase();
  const className = el.className ? `.${el.className.split(' ').join('.')}` : '';
  return `${tag}${className}[${index}]`;
}

export function InspectorProvider({ children }: { children: ReactNode }) {
  const [active, setActive] = useState(false);
  const [selected, setSelected] = useState<SelectedElement | null>(null);
  const [history, setHistory] = useState<EditSnapshot[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const elementIdMap = useRef<Map<HTMLElement, string>>(new Map());
  let elementCounter = useRef(0);

  // 切换 Inspector 模式
  const toggle = useCallback(() => {
    setActive((a) => {
      if (a) setSelected(null);
      return !a;
    });
  }, []);

  // 选择元素
  const selectElement = useCallback((el: HTMLElement | null) => {
    if (!el) {
      setSelected(null);
      return;
    }

    // 获取或生成元素 ID
    let id = elementIdMap.current.get(el);
    if (!id) {
      id = generateElementId(el, elementCounter.current++);
      elementIdMap.current.set(el, id);
    }

    // 读取计算样式
    const computed = getComputedStyle(el);

    const elementInfo: SelectedElement = {
      id,
      element: el,
      tagName: el.tagName.toLowerCase(),
      text: el.textContent,
      styles: {
        fontSize: parseFloat(computed.fontSize) || 16,
        fontWeight: parseInt(computed.fontWeight, 10) || 400,
        fontStyle: computed.fontStyle === 'italic' ? 'italic' : 'normal',
        color: computed.color,
        backgroundColor: computed.backgroundColor === 'rgba(0, 0, 0, 0)' ? null : computed.backgroundColor,
        textAlign: computed.textAlign as 'left' | 'center' | 'right' | 'justify',
        lineHeight: computed.lineHeight === 'normal' ? null : parseFloat(computed.lineHeight),
      },
    };

    setSelected(elementInfo);
  }, []);

  // 应用编辑
  const applyEdit = useCallback((op: EditOp) => {
    if (!selected) return;

    const el = selected.element;
    let previousValue: string | number = '';

    if (op.type === 'text') {
      previousValue = el.textContent || '';
      el.textContent = String(op.value);
    } else if (op.type === 'style' && op.key) {
      const style = el.style as unknown as Record<string, string>;
      previousValue = style[op.key] || '';
      style[op.key] = String(op.value);
    }

    // 记录历史
    const snapshot: EditSnapshot = {
      elementId: selected.id,
      op,
      previousValue,
    };

    // 截断后续历史
    const newHistory = history.slice(0, historyIndex + 1);
    newHistory.push(snapshot);
    setHistory(newHistory);
    setHistoryIndex(newHistory.length - 1);

    // 更新选中状态
    selectElement(el);
  }, [selected, history, historyIndex, selectElement]);

  // 撤销
  const undo = useCallback(() => {
    if (historyIndex < 0 || !selected) return;

    const snapshot = history[historyIndex];
    const el = selected.element;

    if (snapshot.op.type === 'text') {
      el.textContent = String(snapshot.previousValue);
    } else if (snapshot.op.type === 'style' && snapshot.op.key) {
      const style = el.style as unknown as Record<string, string>;
      style[snapshot.op.key] = String(snapshot.previousValue);
    }

    setHistoryIndex(historyIndex - 1);
    selectElement(el);
  }, [history, historyIndex, selected, selectElement]);

  // 重做
  const redo = useCallback(() => {
    if (historyIndex >= history.length - 1 || !selected) return;

    const snapshot = history[historyIndex + 1];
    const el = selected.element;

    if (snapshot.op.type === 'text') {
      el.textContent = String(snapshot.op.value);
    } else if (snapshot.op.type === 'style' && snapshot.op.key) {
      const style = el.style as unknown as Record<string, string>;
      style[snapshot.op.key] = String(snapshot.op.value);
    }

    setHistoryIndex(historyIndex + 1);
    selectElement(el);
  }, [history, historyIndex, selected, selectElement]);

  // 获取编辑后的 HTML
  const getEditedHtml = useCallback(() => {
    const root = document.querySelector('[data-inspector-root]');
    if (!root) return '';
    return root.innerHTML;
  }, []);

  const value = useMemo<InspectorCtx>(
    () => ({
      active,
      toggle,
      selected,
      selectElement,
      applyEdit,
      undo,
      redo,
      canUndo: historyIndex >= 0,
      canRedo: historyIndex < history.length - 1,
      getEditedHtml,
    }),
    [active, toggle, selected, selectElement, applyEdit, undo, redo, historyIndex, history.length, getEditedHtml],
  );

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

// Inspector 切换按钮
export function InspectorToggleButton() {
  const { active, toggle } = useInspector();

  return (
    <Button
      size="sm"
      variant={active ? 'default' : 'ghost'}
      onClick={toggle}
      data-inspector-ui
      title="检查元素"
    >
      <Crosshair className="size-3.5" />
      <span className="hidden md:inline">检查</span>
    </Button>
  );
}

// 点击捕获层
export function InspectorClickLayer() {
  const { active, selectElement } = useInspector();

  useEffect(() => {
    if (!active) return;

    const root = document.querySelector('[data-inspector-root]');
    if (!root) return;

    const handleClick = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const target = mouseEvent.target as HTMLElement;

      // 忽略 Inspector UI 元素
      if (target.closest('[data-inspector-ui]')) return;

      // 选择点击的元素
      if (root.contains(target)) {
        e.preventDefault();
        e.stopPropagation();
        selectElement(target);
      }
    };

    const handleMouseOver = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const target = mouseEvent.target as HTMLElement;
      if (target.closest('[data-inspector-ui]')) return;

      if (root.contains(target)) {
        // 添加高亮样式
        target.setAttribute('data-inspector-hover', '');
      }
    };

    const handleMouseOut = (e: Event) => {
      const mouseEvent = e as MouseEvent;
      const target = mouseEvent.target as HTMLElement;
      target.removeAttribute('data-inspector-hover');
    };

    root.addEventListener('click', handleClick, true);
    root.addEventListener('mouseover', handleMouseOver, true);
    root.addEventListener('mouseout', handleMouseOut, true);

    return () => {
      root.removeEventListener('click', handleClick, true);
      root.removeEventListener('mouseover', handleMouseOver, true);
      root.removeEventListener('mouseout', handleMouseOut, true);
    };
  }, [active, selectElement]);

  return null;
}
