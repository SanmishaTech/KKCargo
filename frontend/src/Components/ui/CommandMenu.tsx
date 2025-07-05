import { useEffect, useState, useRef } from 'react';
import { Dialog, DialogContent, DialogTitle, DialogDescription } from './dialog';
import { Search } from 'lucide-react';
import { searchconfig, MenuItem } from './searchconfig';

interface CommandMenuProps {
  role?: string;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function CommandMenu({ role, open, onOpenChange }: CommandMenuProps) {
  const [search, setSearch] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const menuItemsRef = useRef<Array<HTMLDivElement | null>>([]);
  const currentRole = role || localStorage.getItem('role') || 'teachingstaff'; // Default to teachingstaff if no role
  
  // Get menu items based on role
  const menuItems = searchconfig[currentRole as keyof typeof searchconfig] || searchconfig.teachingstaff;
  
  // Process menu items with preserved hierarchy for searching and display
  const processMenuItems = () => {
    // For flat list searching
    const flatList: Array<{title: string, url?: string, icon?: React.ElementType, category?: string}> = [];
    
    // For grouped display with preserved hierarchy
    const groupedList: Record<string, Array<{title: string, url?: string, icon?: React.ElementType}>> = {};
    
    // Process each top-level menu item
    menuItems.forEach((item: MenuItem) => {
      // If it has a URL, add to flat list
      if (item.url) {
        flatList.push({ 
          title: item.title, 
          url: item.url, 
          icon: item.icon,
          category: 'Main Menu'
        });
      }
      
      // If it has children, process as a category
      if (item.children && item.children.length > 0) {
        // Create category in grouped list
        const categoryName = item.title;
        if (!groupedList[categoryName]) {
          groupedList[categoryName] = [];
        }
        
        // Add all children to both lists
        item.children.forEach(child => {
          if (child.url) {
            // Add to flat list with category info
            flatList.push({
              title: child.title,
              url: child.url,
              icon: child.icon,
              category: categoryName
            });
            
            // Add to grouped list under appropriate category
            groupedList[categoryName].push({
              title: child.title,
              url: child.url,
              icon: child.icon
            });
          }
        });
      }
    });
    
    // If no categories were created but we have items, ensure a default category exists
    if (Object.keys(groupedList).length === 0 && flatList.length > 0) {
      groupedList['Main Menu'] = flatList;
    }
    
    return { flatList, groupedList };
  };
  
  // Get both flat and grouped representations of menu items
  const { flatList, groupedList } = processMenuItems();
  
  // Filter items based on search term
  const filteredItems = search.length === 0 
    ? flatList 
    : flatList.filter(item => 
        item.title.toLowerCase().includes(search.toLowerCase()) && item.url
      );
      
  // Create a filtered version of the grouped list based on search results
  const filteredGroupedItems = search.length === 0
    ? groupedList
    : filteredItems.reduce((acc, item) => {
        const category = item.category || 'Main Menu';
        if (!acc[category]) {
          acc[category] = [];
        }
        acc[category].push(item);
        return acc;
      }, {} as Record<string, Array<{title: string, url?: string, icon?: React.ElementType, category?: string}>>);
      
  // Use the filtered grouped items for display
  const groupedItems = filteredGroupedItems;



  // Handle keyboard navigation
  useEffect(() => {
    if (!open) return;

    const handleKeyDown = (e: KeyboardEvent) => {
      if (filteredItems.length === 0) return;
      
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filteredItems.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : 0));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        const selectedItem = filteredItems[selectedIndex];
        if (selectedItem?.url) {
          runCommand(selectedItem.url);
        }
      }
      
      // Scroll the selected item into view
      if (menuItemsRef.current[selectedIndex]) {
        menuItemsRef.current[selectedIndex]?.scrollIntoView({
          block: 'nearest'
        });
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [open, search, selectedIndex, filteredItems]);
  
  // Reset selected index when search changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [search]);

  const runCommand = (path: string) => {
    onOpenChange(false);
    window.location.href = path;
  };
  
  return (
    <>
      {/* Custom search dialog */}
      <Dialog open={open} onOpenChange={onOpenChange}>
        <DialogContent className="p-0 overflow-hidden max-w-2xl bg-white">
          <DialogTitle className="sr-only">Search navigation</DialogTitle>
          <DialogDescription className="sr-only">Search for navigation items and pages in the application</DialogDescription>
          <div className="flex items-center border-b px-3">
            <Search className="mr-2 h-4 w-4 shrink-0 opacity-50" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Type to search..."
              className="flex h-11 w-full rounded-md bg-transparent py-3 text-sm outline-none placeholder:text-muted-foreground"
              autoFocus
            />
          </div>
          <div className="max-h-[500px] overflow-y-auto">
            {filteredItems.length === 0 ? (
              <div className="py-6 text-center text-sm">No results found.</div>
            ) : (
              Object.entries(groupedItems).map(([category, items]) => {
                // Skip empty categories
                if (items.length === 0) return null;
                
                return (
                  <div key={category} className="p-2">
                    {category !== 'General' && (
                      <div className="px-2 py-1.5 text-xs font-medium text-muted-foreground">
                        {category}
                      </div>
                    )}
                    {items.map((item) => (
                      item.url && (
                        <div
                          key={item.url}
                          ref={el => {
                            const index = filteredItems.findIndex(i => i.url === item.url);
                            if (index !== -1) {
                              menuItemsRef.current[index] = el;
                            }
                          }}
                          className={`relative flex cursor-default select-none items-center rounded-sm px-2 py-1.5 text-sm outline-none ${
                            selectedIndex === filteredItems.findIndex(i => i.url === item.url) 
                              ? 'bg-accent text-accent-foreground' 
                              : 'hover:bg-accent hover:text-accent-foreground'
                          }`}
                          onClick={() => runCommand(item.url!)}
                        >
                          {item.icon && <item.icon className="mr-2 h-4 w-4 shrink-0" />}
                          {item.title}
                        </div>
                      )
                    ))}
                    <div className="-mx-1 h-px bg-border my-1"></div>
                  </div>
                );
              })
            )}
          </div>
        </DialogContent>
      </Dialog>
    </>
  );
}
