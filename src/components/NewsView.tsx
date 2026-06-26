import React from 'react';
import { Calendar, ShieldAlert, Radio } from 'lucide-react';
import { NewsItem } from '../types';

interface NewsViewProps {
  news: NewsItem[];
}

export default function NewsView({ news }: NewsViewProps) {
  return (
    <div className="flex flex-col gap-4 text-xs">
      <div className="bg-white border border-gray-300 rounded-sm p-4 shadow-xs">
        <h2 className="text-sm font-bold text-[#0c5460] uppercase border-b pb-2 mb-4 flex items-center gap-2">
          <Radio className="w-4 h-4 text-rose-600 animate-pulse" /> Global System Announcements
        </h2>
        
        <div className="flex flex-col gap-4">
          {news.map(item => (
            <div
              key={item.id}
              className={`p-4 rounded-sm border transition-all ${
                item.important
                  ? 'bg-rose-50/50 border-rose-200 shadow-2xs'
                  : 'bg-gray-50 border-gray-200'
              }`}
            >
              <div className="flex justify-between items-start gap-4 mb-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <h3 className="font-extrabold text-sm text-gray-900 tracking-tight">
                    {item.title}
                  </h3>
                  {item.important && (
                    <span className="bg-rose-100 text-rose-800 border border-rose-200 px-1.5 py-0.5 rounded-[2px] text-[9px] font-black uppercase flex items-center gap-1">
                      <ShieldAlert className="w-3 h-3 text-rose-600" /> CRITICAL
                    </span>
                  )}
                </div>
                <div className="flex items-center gap-1 text-gray-400 font-medium whitespace-nowrap text-[10px]">
                  <Calendar className="w-3.5 h-3.5 text-gray-400" />
                  <span>{item.date}</span>
                </div>
              </div>
              <p className="text-gray-600 leading-relaxed font-normal text-xs">{item.content}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
