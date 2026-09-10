import { useGetMissingEpisodes } from "@/api/hooks/anime_entries.hooks"
import { useServerStatus } from "@/app/(main)/_hooks/use-server-status"
import { IconButton } from "@/components/ui/button"
import { Popover } from "@/components/ui/popover"
import { useRouter } from "@/lib/navigation"
import React from "react"
import { LuTv, LuInfo } from "react-icons/lu"
import { cn } from "@/components/ui/core/styling"

export function MissingEpisodesBadge() {
    const serverStatus = useServerStatus()
    const isOffline = serverStatus?.isOffline

    const { data } = useGetMissingEpisodes(!isOffline)

    const router = useRouter()

    if (isOffline || !data?.episodes || data.episodes.length === 0) {
        return null
    }

    const missingCount = data.episodes.length

    return (
        <Popover
            trigger={
                <div className="relative">
                    <IconButton
                        icon={<LuTv />}
                        intent="white-subtle"
                        size="md"
                    />
                    <div className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 flex items-center justify-center rounded-full bg-brand text-white text-[10px] font-bold border-2 border-[--background] z-10 pointer-events-none">
                        {missingCount > 99 ? "99+" : missingCount}
                    </div>
                </div>
            }
            className="w-80 p-0"
        >
            <div className="p-3 border-b border-white/5 bg-black/20 flex items-center gap-2">
                <LuInfo className="text-brand-300" />
                <p className="text-sm font-semibold text-white">Missing Episodes</p>
            </div>
            <div className="max-h-80 overflow-y-auto p-2 space-y-1">
                {data.episodes.slice(0, 10).map((ep, idx) => (
                    <button
                        key={idx}
                        onClick={() => router.push("/entry?id=" + ep.baseAnime?.id)}
                        className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/5 transition-colors text-left"
                    >
                        {ep.baseAnime?.coverImage?.medium && (
                            <img src={ep.baseAnime.coverImage.medium} alt="" className="w-8 h-10 object-cover rounded flex-shrink-0" />
                        )}
                        <div className="min-w-0 flex-1">
                            <p className="text-xs font-semibold text-gray-200 truncate">
                                {ep.baseAnime?.title?.userPreferred ?? "Unknown Anime"}
                            </p>
                            <p className="text-[10px] text-brand-300 mt-0.5">
                                Episode {ep.episodeNumber}
                            </p>
                        </div>
                    </button>
                ))}
                {missingCount > 10 && (
                    <div className="p-2 text-center text-xs text-gray-500 font-semibold">
                        + {missingCount - 10} more
                    </div>
                )}
            </div>
        </Popover>
    )
}
