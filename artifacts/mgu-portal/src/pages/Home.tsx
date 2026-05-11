import { useState, useMemo, useCallback, useRef } from "react";
import mguBg from "@assets/мгу_фон_1776378187237.jpg";
import { useQueryClient } from "@tanstack/react-query";
import { Search, Plus, ExternalLink, Pencil, Trash2, GripVertical, X, Download, Info, Link, Pin, PinOff, LogIn, LogOut, User } from "lucide-react";
import { useUser, useClerk } from "@clerk/react";
import { useLocation } from "wouter";
import {
  useListWidgets,
  getListWidgetsQueryKey,
  useCreateWidget,
  useUpdateWidget,
  useDeleteWidget,
} from "@workspace/api-client-react";
import {
  DndContext,
  closestCenter,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from "@dnd-kit/core";
import {
  SortableContext,
  arrayMove,
  rectSortingStrategy,
  useSortable,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Skeleton } from "@/components/ui/skeleton";
import { WidgetFormModal } from "@/components/WidgetFormModal";
import { WidgetDeleteModal } from "@/components/WidgetDeleteModal";
import type { Widget } from "@workspace/api-client-react";
import { usePWAInstall } from "@/hooks/usePWAInstall";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";


interface SortableWidgetCardProps {
  widget: Widget;
  dragOccurred: React.MutableRefObject<boolean>;
  onEdit: (w: Widget) => void;
  onDelete: (w: Widget) => void;
  onPin: (w: Widget) => void;
}

function SortableWidgetCard({ widget, dragOccurred, onEdit, onDelete, onPin }: SortableWidgetCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: widget.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.45 : 1,
    zIndex: isDragging ? 10 : undefined,
  };

  const handleCardClick = () => {
    if (dragOccurred.current) {
      dragOccurred.current = false;
      return;
    }
    window.open(widget.url, "_blank", "noopener,noreferrer");
  };

  return (
    <div ref={setNodeRef} style={style} className="group relative">
      {/* Info button — outside the clickable div so it doesn't trigger navigation */}
      <Popover>
        <PopoverTrigger asChild>
          <button
            className="absolute bottom-2 right-2 sm:bottom-3 sm:right-3 z-20
              opacity-60 sm:opacity-0 sm:group-hover:opacity-60 hover:!opacity-100 transition-opacity
              text-muted-foreground hover:text-primary p-1 rounded-md
              hover:bg-muted/60"
            aria-label="Информация о виджете"
          >
            <Info className="h-3.5 w-3.5" />
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="end" className="w-72 p-3 text-sm z-50">
          <p className="font-semibold text-foreground mb-2">{widget.title}</p>
          {widget.description && (
            <p className="text-muted-foreground text-xs mb-3 leading-relaxed">{widget.description}</p>
          )}
          <a
            href={widget.url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 text-xs text-primary hover:underline break-all"
          >
            <Link className="h-3 w-3 shrink-0" />
            {widget.url}
          </a>
        </PopoverContent>
      </Popover>

      <div
        role="link"
        tabIndex={0}
        data-testid={`card-widget-${widget.id}`}
        onClick={handleCardClick}
        onKeyDown={(e) => e.key === "Enter" && handleCardClick()}
        className="block cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary focus-visible:ring-offset-2 rounded-xl sm:rounded-2xl"
      >
        <Card className="rounded-xl sm:rounded-2xl border border-border/50 shadow-sm hover:shadow-md hover:border-primary/30 transition-all duration-300 h-28 sm:h-32 bg-card/80 backdrop-blur-sm hover:-translate-y-1 relative overflow-hidden">
          {/* Drag handle — hidden visually, functionality preserved */}
          <div
            {...attributes}
            {...listeners}
            onClick={(e) => e.preventDefault()}
            className="sr-only"
          >
            <GripVertical className="h-4 w-4" />
          </div>

          {/* Pin button — hidden visually, functionality preserved */}
          <Button
            size="icon"
            variant="ghost"
            data-testid={`button-pin-widget-${widget.id}`}
            className="sr-only"
            onClick={(e) => {
              e.preventDefault();
              e.stopPropagation();
              onPin(widget);
            }}
            title={widget.pinned ? "Открепить" : "Закрепить"}
          >
            {widget.pinned ? <PinOff className="h-3.5 w-3.5 sm:h-4 sm:w-4" /> : <Pin className="h-3.5 w-3.5 sm:h-4 sm:w-4" />}
            <span className="sr-only">{widget.pinned ? "Открепить" : "Закрепить"}</span>
          </Button>

          <CardContent className="p-4 sm:p-6 h-full flex items-center">
            <div className="flex gap-3 sm:gap-4 items-center w-full">
              <div className="flex-shrink-0 w-11 h-11 sm:w-14 sm:h-14 rounded-xl sm:rounded-2xl bg-primary/10 flex items-center justify-center text-2xl sm:text-3xl shadow-inner group-hover:bg-primary/20 transition-colors">
                {widget.icon ? (
                  <span>{widget.icon}</span>
                ) : (
                  <ExternalLink className="h-5 w-5 sm:h-6 sm:w-6 text-primary" />
                )}
              </div>
              <div className="min-w-0">
                <h3 className="font-semibold text-base sm:text-lg text-foreground group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                  {widget.title}
                </h3>
                {widget.description && (
                  <p className="text-xs sm:text-sm text-muted-foreground mt-0.5 sm:mt-1 line-clamp-2 leading-relaxed">
                    {widget.description}
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

export default function Home() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const { canInstall, install } = usePWAInstall();
  const { isSignedIn, user } = useUser();
  const { signOut } = useClerk();
  const [, setLocation] = useLocation();
  const [searchQuery, setSearchQuery] = useState("");
  const [localPinnedOrder, setLocalPinnedOrder] = useState<number[] | null>(null);
  const [localUnpinnedOrder, setLocalUnpinnedOrder] = useState<number[] | null>(null);
  const dragOccurred = useRef(false);

  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [selectedWidget, setSelectedWidget] = useState<Widget | undefined>(undefined);

  const { data: widgetsData, isLoading } = useListWidgets();

  const createWidget = useCreateWidget();
  const updateWidget = useUpdateWidget();
  const deleteWidget = useDeleteWidget();

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 150, tolerance: 5 } })
  );

  const resetLocalOrders = () => {
    setLocalPinnedOrder(null);
    setLocalUnpinnedOrder(null);
  };

  const handleCreateOrUpdate = (values: any) => {
    if (selectedWidget) {
      updateWidget.mutate(
        { id: selectedWidget.id, data: values },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListWidgetsQueryKey() });
            setFormOpen(false);
            toast({ title: "Успех", description: "Виджет обновлён" });
          },
          onError: () => {
            toast({ title: "Ошибка", description: "Не удалось обновить виджет", variant: "destructive" });
          }
        }
      );
    } else {
      createWidget.mutate(
        { data: values },
        {
          onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: getListWidgetsQueryKey() });
            resetLocalOrders();
            setFormOpen(false);
            toast({ title: "Успех", description: "Виджет создан" });
          },
          onError: () => {
            toast({ title: "Ошибка", description: "Не удалось создать виджет", variant: "destructive" });
          }
        }
      );
    }
  };

  const handleDelete = () => {
    if (!selectedWidget) return;
    deleteWidget.mutate(
      { id: selectedWidget.id },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWidgetsQueryKey() });
          resetLocalOrders();
          setDeleteOpen(false);
          toast({ title: "Успех", description: "Виджет удалён" });
        },
        onError: () => {
          toast({ title: "Ошибка", description: "Не удалось удалить виджет", variant: "destructive" });
        }
      }
    );
  };

  const handlePin = useCallback((widget: Widget) => {
    updateWidget.mutate(
      { id: widget.id, data: { pinned: !widget.pinned } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getListWidgetsQueryKey() });
          toast({ title: widget.pinned ? "Виджет откреплён" : "Виджет закреплён" });
        },
        onError: () => {
          toast({ title: "Ошибка", description: "Не удалось изменить закрепление", variant: "destructive" });
        }
      }
    );
  }, [updateWidget, queryClient, toast]);

  const rawWidgets = widgetsData ?? [];

  const applyLocalOrder = (widgets: Widget[], localOrder: number[] | null) => {
    const sorted = [...widgets].sort((a, b) => a.order - b.order);
    if (!localOrder) return sorted;
    const idxMap = new Map(localOrder.map((id, i) => [id, i]));
    return [...sorted].sort((a, b) => (idxMap.get(a.id) ?? 9999) - (idxMap.get(b.id) ?? 9999));
  };

  const filterWidgets = (widgets: Widget[]) => {
    if (!searchQuery) return widgets;
    const q = searchQuery.toLowerCase();
    return widgets.filter(w =>
      w.title.toLowerCase().includes(q) ||
      (w.description && w.description.toLowerCase().includes(q)) ||
      w.url.toLowerCase().includes(q)
    );
  };

  const pinnedWidgets = useMemo(() =>
    filterWidgets(applyLocalOrder(rawWidgets.filter(w => w.pinned), localPinnedOrder)),
    [rawWidgets, localPinnedOrder, searchQuery]
  );

  const unpinnedWidgets = useMemo(() =>
    filterWidgets(applyLocalOrder(rawWidgets.filter(w => !w.pinned), localUnpinnedOrder)),
    [rawWidgets, localUnpinnedOrder, searchQuery]
  );

  const makeDragEndHandler = useCallback((
    sectionWidgets: Widget[],
    setOrder: React.Dispatch<React.SetStateAction<number[] | null>>
  ) => (event: DragEndEvent) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const ids = sectionWidgets.map(w => w.id);
    const oldIndex = ids.indexOf(active.id as number);
    const newIndex = ids.indexOf(over.id as number);
    if (oldIndex === -1 || newIndex === -1) return;
    const newOrder = arrayMove(ids, oldIndex, newIndex);
    setOrder(newOrder);
    newOrder.forEach((id, index) => {
      updateWidget.mutate({ id, data: { order: index } }, {
        onSuccess: () => queryClient.invalidateQueries({ queryKey: getListWidgetsQueryKey() })
      });
    });
  }, [updateWidget, queryClient]);

  return (
    <div className="min-h-screen bg-background font-sans">
      {/* Hero Section */}
      <section className="relative h-[300px] sm:h-[360px] md:h-[480px] flex items-center justify-center overflow-hidden">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: `url(${mguBg})`, backgroundColor: "hsl(var(--primary))" }}
        >
          <div className="absolute inset-0 bg-primary/70 mix-blend-multiply" />
          <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-transparent to-background/90" />
        </div>

        {/* Auth controls — top right */}
        <div className="absolute top-3 right-3 sm:top-4 sm:right-4 z-20 flex items-center gap-2">
          {isSignedIn ? (
            <>
              <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-sm rounded-full px-3 py-1.5 text-white text-sm">
                <User className="h-3.5 w-3.5 shrink-0" />
                <span className="max-w-[140px] truncate">{user?.primaryEmailAddress?.emailAddress ?? user?.firstName}</span>
              </div>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => signOut({ redirectUrl: `${import.meta.env.BASE_URL}` })}
                className="text-white hover:text-white hover:bg-white/20 rounded-full gap-1.5 text-xs sm:text-sm"
              >
                <LogOut className="h-3.5 w-3.5" />
                <span className="hidden sm:inline">Выйти</span>
              </Button>
            </>
          ) : (
            <Button
              size="sm"
              onClick={() => setLocation("/sign-in")}
              className="bg-white/10 hover:bg-white/25 backdrop-blur-sm text-white border border-white/20 rounded-full gap-1.5 text-xs sm:text-sm"
            >
              <LogIn className="h-3.5 w-3.5" />
              Войти
            </Button>
          )}
        </div>

        <div className="relative z-10 text-center px-4 w-full max-w-4xl mx-auto">
          <h1 className="text-2xl sm:text-4xl md:text-5xl font-serif font-bold text-white mb-4 sm:mb-8 tracking-tight drop-shadow-md">
            Витрина услуг МГУ
          </h1>

          <div className="relative max-w-2xl mx-auto shadow-xl group transition-all duration-300">
            <div className="absolute inset-y-0 left-0 pl-3 sm:pl-4 flex items-center pointer-events-none">
              <Search className="h-5 w-5 sm:h-6 sm:w-6 text-muted-foreground group-focus-within:text-primary transition-colors" />
            </div>
            <Input
              data-testid="input-search"
              type="text"
              placeholder="Поиск услуг..."
              className="pl-10 sm:pl-12 pr-10 sm:pr-12 py-5 sm:py-7 w-full rounded-xl sm:rounded-2xl border-0 bg-white/95 backdrop-blur shadow-inner text-base sm:text-lg placeholder:text-muted-foreground focus-visible:ring-4 focus-visible:ring-primary/50 transition-all"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute inset-y-0 right-0 pr-3 sm:pr-4 flex items-center text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Очистить поиск"
              >
                <X className="h-5 w-5" />
              </button>
            )}
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="max-w-6xl mx-auto px-3 sm:px-4 py-6 sm:py-12 -mt-4 sm:-mt-8 relative z-20 pb-24 sm:pb-12">
        <div className="flex justify-between items-center mb-5 sm:mb-8">
          <h2 className="text-xl sm:text-2xl md:text-3xl font-bold text-foreground">
            Топ услуг
          </h2>
          <div className="hidden sm:flex gap-2">
            {canInstall && (
              <Button
                variant="outline"
                onClick={install}
                className="rounded-full shadow-sm hover:shadow-md transition-all gap-2"
              >
                <Download className="h-4 w-4" />
                Установить приложение
              </Button>
            )}
          </div>
        </div>

        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
            {[1, 2, 3, 4, 5, 6].map(i => (
              <Card key={i} className="rounded-xl sm:rounded-2xl border-none shadow-sm h-32 sm:h-40">
                <CardContent className="p-4 sm:p-6">
                  <div className="flex gap-3 sm:gap-4">
                    <Skeleton className="h-11 w-11 sm:h-12 sm:w-12 rounded-xl flex-shrink-0" />
                    <div className="space-y-2 sm:space-y-3 flex-1">
                      <Skeleton className="h-5 w-full" />
                      <Skeleton className="h-4 w-4/5" />
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        ) : (pinnedWidgets.length === 0 && unpinnedWidgets.length === 0) ? (
          <div className="text-center py-14 sm:py-20 bg-muted/30 rounded-2xl sm:rounded-3xl border border-dashed border-border">
            <div className="w-14 h-14 sm:w-16 sm:h-16 bg-muted rounded-full flex items-center justify-center mx-auto mb-3 sm:mb-4">
              <Search className="h-7 w-7 sm:h-8 sm:w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg sm:text-xl font-medium text-foreground mb-2">Ничего не найдено</h3>
            <p className="text-sm sm:text-base text-muted-foreground max-w-xs sm:max-w-md mx-auto px-4">
              По запросу «{searchQuery}» нет результатов. Попробуйте изменить запрос.
            </p>
            <Button
              variant="outline"
              className="mt-5 sm:mt-6"
              onClick={() => setSearchQuery("")}
            >
              Сбросить поиск
            </Button>
          </div>
        ) : (
          <div className="space-y-8 sm:space-y-10">
            {/* Pinned section */}
            {pinnedWidgets.length > 0 && (
              <div>
                <div className="flex items-center gap-2 mb-4">
                  <Pin className="h-4 w-4 text-amber-500" />
                  <h3 className="text-base sm:text-lg font-semibold text-foreground">Закреплённые</h3>
                </div>
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={() => { dragOccurred.current = true; }}
                  onDragEnd={makeDragEndHandler(pinnedWidgets, setLocalPinnedOrder)}
                >
                  <SortableContext items={pinnedWidgets.map(w => w.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      {pinnedWidgets.map(widget => (
                        <SortableWidgetCard
                          key={widget.id}
                          widget={widget}
                          dragOccurred={dragOccurred}
                          onEdit={(w) => { setSelectedWidget(w); setFormOpen(true); }}
                          onDelete={(w) => { setSelectedWidget(w); setDeleteOpen(true); }}
                          onPin={handlePin}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}

            {/* Unpinned section */}
            {unpinnedWidgets.length > 0 && (
              <div>
                {pinnedWidgets.length > 0 && (
                  <div className="flex items-center gap-2 mb-4">
                    <h3 className="text-base sm:text-lg font-semibold text-foreground">Все услуги</h3>
                  </div>
                )}
                <DndContext
                  sensors={sensors}
                  collisionDetection={closestCenter}
                  onDragStart={() => { dragOccurred.current = true; }}
                  onDragEnd={makeDragEndHandler(unpinnedWidgets, setLocalUnpinnedOrder)}
                >
                  <SortableContext items={unpinnedWidgets.map(w => w.id)} strategy={rectSortingStrategy}>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-6">
                      {unpinnedWidgets.map(widget => (
                        <SortableWidgetCard
                          key={widget.id}
                          widget={widget}
                          dragOccurred={dragOccurred}
                          onEdit={(w) => { setSelectedWidget(w); setFormOpen(true); }}
                          onDelete={(w) => { setSelectedWidget(w); setDeleteOpen(true); }}
                          onPin={handlePin}
                        />
                      ))}
                    </div>
                  </SortableContext>
                </DndContext>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Floating buttons — mobile only */}
      <div className="fixed bottom-5 right-4 sm:hidden z-30 flex flex-col gap-3 items-end">
        {canInstall && (
          <Button
            size="lg"
            variant="outline"
            onClick={install}
            className="rounded-full shadow-lg h-12 w-12 p-0 flex items-center justify-center bg-background"
          >
            <Download className="h-5 w-5" />
            <span className="sr-only">Установить приложение</span>
          </Button>
        )}
      </div>

      <WidgetFormModal
        open={formOpen}
        onOpenChange={setFormOpen}
        widget={selectedWidget}
        onSubmit={handleCreateOrUpdate}
        isPending={createWidget.isPending || updateWidget.isPending}
      />

      <WidgetDeleteModal
        open={deleteOpen}
        onOpenChange={setDeleteOpen}
        onConfirm={handleDelete}
        title={selectedWidget?.title}
        isPending={deleteWidget.isPending}
      />
    </div>
  );
}
