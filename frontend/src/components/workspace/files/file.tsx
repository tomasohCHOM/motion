import { Download, MoreHorizontal, Star } from 'lucide-react'
import { formatDate, getFileIcon, getFileTypeColor } from './utils'
import type { FileItem } from '@/static/workspace/files'
import { Card, CardContent } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { getMemberInitials } from '@/utils/initals'
import { Badge } from '@/components/ui/badge'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { Button } from '@/components/ui/button'

export const FileCard: React.FC<{ item: FileItem }> = ({ item }) => {
  return (
    <Card className="hover:shadow-md p-2 transition-shadow cursor-pointer">
      <CardContent className="p-4">
        <div className="flex items-center gap-3">
          <div className="flex-shrink-0">{getFileIcon(item)}</div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <h4 className="font-medium text-sm truncate">{item.name}</h4>
              {item.starred && (
                <Star className="h-3 w-3 text-yellow-500 fill-yellow-500 flex-shrink-0" />
              )}
            </div>

            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <span>{item.size}</span>
              <span>•</span>
              <span>Modified {formatDate(item.modifiedAt)}</span>
              <span>•</span>
              <div className="flex items-center gap-1">
                <Avatar className="h-4 w-4">
                  <AvatarImage src={item.modifiedBy.avatar} />
                  <AvatarFallback className="text-xs">
                    {getMemberInitials(item.modifiedBy.name)}
                  </AvatarFallback>
                </Avatar>
                <span>{item.modifiedBy.name}</span>
              </div>
            </div>

            <Badge
              variant="secondary"
              className={`text-xs mt-2 ${getFileTypeColor(item.fileType)}`}
            >
              {item.fileType}
            </Badge>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 flex-shrink-0"
              >
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem>
                <Download className="h-4 w-4 mr-2" />
                Download
              </DropdownMenuItem>
              <DropdownMenuItem>
                <Star className="h-4 w-4 mr-2" />
                {item.starred ? 'Unstar' : 'Star'}
              </DropdownMenuItem>
              <DropdownMenuItem className="text-destructive">
                Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardContent>
    </Card>
  )
}
