"use client";

import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Plus, Edit3, Trash2, BookOpen } from "lucide-react";
import { formatDateTimeDDMMYYYYHHmm } from "@/utils/format";
import type { Module, Chapter } from "@/types";

interface ModulesAccordionProps {
  modules: Module[];
  chaptersByModule: Record<string, Chapter[]>;
  onCreateModule: () => void;
  onEditModule: (module: Module) => void;
  onDeleteModule: (module: Module) => void;
  onCreateChapter: (module: Module) => void;
  onEditChapter: (module: Module, chapter: Chapter) => void;
  onDeleteChapter: (chapter: Chapter) => void;
}

export const ModulesAccordion = React.memo<ModulesAccordionProps>(({
  modules,
  chaptersByModule,
  onCreateModule,
  onEditModule,
  onDeleteModule,
  onCreateChapter,
  onEditChapter,
  onDeleteChapter
}) => {
  return (
    <Card className="border-0 mt-6 shadow-lg bg-white rounded-xl overflow-hidden">
      <div className="bg-gradient-to-r from-blue-500 to-indigo-600 h-1"></div>
      <CardHeader className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-200 pb-6">
        <div>
          <CardTitle className="text-slate-800 flex items-center gap-2">
            <div className="p-1.5 bg-blue-100 rounded-lg">
              <BookOpen className="h-5 w-5 text-blue-600" />
            </div>
            Modules
          </CardTitle>
          <CardDescription className="text-slate-600 mt-1">
            Course → Modules → Chapters
          </CardDescription>
        </div>
        <Button 
          onClick={onCreateModule} 
          className="bg-indigo-600 hover:bg-indigo-700 gap-2 transition-all duration-200 shadow-md hover:shadow-lg w-full sm:w-auto"
        >
          <Plus className="h-4 w-4" /> Add Module
        </Button>
      </CardHeader>
      
      <CardContent className="pt-6">
        <Accordion type="multiple" className="w-full space-y-4">
          {modules.map((module) => (
            <AccordionItem 
              key={module.module_id} 
              value={module.module_id} 
              className="border border-slate-200 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-all duration-200"
            >
              <AccordionTrigger className="px-6 py-4 bg-white hover:bg-slate-50">
                <div className="flex flex-col items-start text-left w-full">
                  <div className="font-semibold text-slate-900 text-lg">{module.title}</div>
                  <div className="text-sm text-slate-600 line-clamp-2 mt-1">{module.description}</div>
                  <div className="text-xs text-slate-500 mt-2 flex gap-6">
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-blue-400"></span>
                      Order: {String(module.order_number ?? "-")}
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="inline-block w-2 h-2 rounded-full bg-indigo-400"></span>
                      Created: {module.created_at ? formatDateTimeDDMMYYYYHHmm(module.created_at) : "-"}
                    </span>
                  </div>
                </div>
              </AccordionTrigger>
              
              <AccordionContent className="bg-slate-50 border-t border-slate-200">
                <div className="flex flex-col sm:flex-row justify-end gap-2 px-4 sm:px-6 py-3 bg-white border-b border-slate-200">
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onEditModule(module)} 
                    className="h-9 w-full sm:w-auto px-3 hover:bg-blue-50 hover:text-blue-700 transition-colors duration-200"
                  >
                    <Edit3 className="h-4 w-4 text-blue-600 mr-1" /> Edit
                  </Button>
                  <Button 
                    variant="outline" 
                    size="sm" 
                    onClick={() => onDeleteModule(module)} 
                    className="h-9 w-full sm:w-auto px-3 hover:bg-red-50 hover:text-red-700 transition-colors duration-200"
                  >
                    <Trash2 className="h-4 w-4 text-red-600 mr-1" /> Delete
                  </Button>
                  <Button 
                    size="sm" 
                    onClick={() => onCreateChapter(module)} 
                    className="bg-blue-600 hover:bg-blue-700 h-9 w-full sm:w-auto transition-all duration-200 shadow-sm hover:shadow"
                  >
                    <Plus className="h-4 w-4 mr-1" /> Add Chapter
                  </Button>
                </div>
                
                <div className="overflow-x-auto mt-3 px-2 sm:px-4 pb-4">
                  <Table className="border border-slate-200 rounded-lg overflow-hidden">
                    <TableHeader>
                      <TableRow className="bg-slate-50 border-b border-slate-200">
                        <TableHead className="min-w-[150px] sm:min-w-[220px] font-semibold text-slate-700">Title</TableHead>
                        <TableHead className="hidden md:table-cell min-w-[260px] font-semibold text-slate-700">Description</TableHead>
                        <TableHead className="w-20 sm:w-40 font-semibold text-slate-700">Video</TableHead>
                        <TableHead className="w-16 sm:table-cell font-semibold text-slate-700">Order</TableHead>
                        <TableHead className="hidden sm:table-cell w-48 font-semibold text-slate-700">Created</TableHead>
                        <TableHead className="w-20 sm:w-28 text-right font-semibold text-slate-700">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {(chaptersByModule[module.module_id] || []).map((chapter, idx) => (
                        <TableRow
                          key={chapter.chapter_id}
                          className={`hover:bg-slate-50 transition-colors duration-150 ${
                            idx % 2 === 0 ? "bg-white" : "bg-slate-50"
                          }`}
                        >
                          <TableCell className="font-medium text-slate-900 truncate max-w-[120px] sm:max-w-none">
                            {chapter.title}
                          </TableCell>
                          <TableCell className="hidden md:table-cell text-slate-700 truncate max-w-xl">
                            {chapter.description}
                          </TableCell>
                          <TableCell>
                            {chapter.video_link ? (
                              <a
                                href={chapter.video_link}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="text-blue-600 hover:text-blue-800 underline flex items-center gap-1 transition-colors duration-200"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  width="14"
                                  height="14"
                                  viewBox="0 0 24 24"
                                  fill="none"
                                  stroke="currentColor"
                                  strokeWidth="2"
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                >
                                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
                                  <polyline points="15 3 21 3 21 9"></polyline>
                                  <line x1="10" y1="14" x2="21" y2="3"></line>
                                </svg>
                                <span className="hidden sm:inline">View</span>
                              </a>
                            ) : (
                              <span className="text-slate-400 italic text-xs sm:text-sm">No link</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className="inline-flex items-center justify-center px-1.5 sm:px-2 py-0.5 sm:py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800">
                              {String(chapter.order_number ?? "-")}
                            </span>
                          </TableCell>
                          <TableCell className="hidden sm:table-cell text-xs text-slate-600">
                            {chapter.created_at ? formatDateTimeDDMMYYYYHHmm(chapter.created_at) : "-"}
                          </TableCell>
                          <TableCell className="text-right">
                            <div className="flex justify-end gap-1 sm:gap-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onEditChapter(module, chapter)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-blue-100 hover:border-blue-300 transition-colors duration-200"
                              >
                                <Edit3 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-blue-600" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => onDeleteChapter(chapter)}
                                className="h-7 w-7 sm:h-8 sm:w-8 p-0 rounded-full hover:bg-red-100 hover:border-red-300 transition-colors duration-200"
                              >
                                <Trash2 className="h-3 w-3 sm:h-3.5 sm:w-3.5 text-red-600" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      ))}
                      {(!chaptersByModule[module.module_id] || chaptersByModule[module.module_id].length === 0) && (
                        <TableRow>
                          <TableCell colSpan={6} className="text-center py-6 sm:py-8">
                            <div className="flex flex-col items-center justify-center text-slate-500">
                              <svg
                                xmlns="http://www.w3.org/2000/svg"
                                width="20"
                                height="20"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="currentColor"
                                strokeWidth="2"
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                className="mb-2 text-slate-400 sm:w-24 sm:h-24"
                              >
                                <path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7-10-7-10-7Z"></path>
                                <circle cx="12" cy="12" r="3"></circle>
                              </svg>
                              <p className="text-sm sm:text-base">No chapters yet</p>
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => onCreateChapter(module)}
                                className="mt-2 text-blue-600 border-blue-200 hover:bg-blue-50 text-xs sm:text-sm"
                              >
                                <Plus className="h-3 w-3 sm:h-4 sm:w-4 mr-1" />
                                Add your first chapter
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </AccordionContent>
            </AccordionItem>
          ))}
          {modules.length === 0 && (
            <div className="text-center text-slate-500 py-10">
              No modules yet. Click "Add Module" to create one.
            </div>
          )}
        </Accordion>
      </CardContent>
    </Card>
  );
});

ModulesAccordion.displayName = "ModulesAccordion";
