import React from "react";
import { useSession } from "./lib/auth-client";
import { useNavigate } from "react-router-dom";
import { useIsMobile } from "./hooks/useIsMobile";
import { downloadAttendanceSheet } from "./utils/attendanceSheet";
import {
  EditRegular, EyeRegular, AddCircle32Color, MoreHorizontal20Regular,
  DeleteRegular, DocumentArrowDown20Regular, CalendarAddRegular
} from "@fluentui/react-icons";
import YourPostsDialogs from "./YourPostsDialogs";

interface PostData {
  id: number;
  title: string;
  description: string;
  location: string;
  start_datetime: string;
  end_datetime: string;
  max_participants: number;
  current_participants: number;
  user_name: string;
  visible: number;
  created_at: string;
  image_url?: string;
}

type TabValue = "created" | "saved" | "joined";

function truncate(text: string, isMobile: boolean): string {
  const maxChars = isMobile ? 3 : 20;
  if (text.length <= maxChars) return text;
  return text.substring(0, maxChars) + "...";
}

// Reusable table class constants
const thClass = "text-left text-xs font-semibold text-gray-400 uppercase tracking-wider px-4 py-3 border-b border-gray-700";
const tdClass = "px-4 py-3 text-sm text-gray-300 border-b border-gray-700/50";

function YourPosts() {
  const [deleteModalState, setDeleteModalState] = React.useState<"closed" | "modal" | "confirmation">("closed");
  const [deletePostId, setDeletePostId] = React.useState<number | null>(null);
  const [createModalState, setCreateModalState] = React.useState<"closed" | "modal" | "confirmation">("closed");
  const [editModalState, setEditModalState] = React.useState<"closed" | "modal" | "confirmation">("closed");
  const [currentEditingPost, setCurrentEditingPost] = React.useState<PostData | null>(null);
  const [downloadingAttendance, setDownloadingAttendance] = React.useState<number | null>(null);
  const [showCalendarExport, setShowCalendarExport] = React.useState(false);
  const [selectedEvent, setSelectedEvent] = React.useState<PostData | null>(null);

  const [posts, setPosts] = React.useState<PostData[]>([]);
  const [savedPosts, setSavedPosts] = React.useState<PostData[]>([]);
  const [joinedPosts, setJoinedPosts] = React.useState<PostData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [activeTab, setActiveTab] = React.useState<TabValue>("created");
  const [openMenuId, setOpenMenuId] = React.useState<number | null>(null);

  const { data: session, isPending } = useSession();
  const navigate = useNavigate();
  const isMobile = useIsMobile();

  const handleDownloadAttendance = async (postId: number) => {
    try {
      setDownloadingAttendance(postId);
      const res = await fetch(`/api/posts/${postId}/attendance`, {
        credentials: "include",
      });
      if (!res.ok) {
        const error = await res.json();
        alert(error.error || "Failed to download attendance sheet");
        return;
      }
      const data = await res.json();
      downloadAttendanceSheet(
        {
          title: data.event.title,
          description: data.event.description,
          location: data.event.location,
          start_datetime: data.event.start_datetime,
          end_datetime: data.event.end_datetime,
          organizer: data.event.user_name,
        },
        data.participants
      );
    } catch (error) {
      console.error("Download error:", error);
      alert("Failed to download attendance sheet");
    } finally {
      setDownloadingAttendance(null);
    }
  };

  const fetchPosts = React.useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch("/api/posts/my-posts", { credentials: "include" });
      if (!res.ok) throw new Error("Failed to fetch posts");
      const data = await res.json();
      setPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching posts:", error);
      setPosts([]);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchSavedPosts = React.useCallback(async () => {
    try {
      const res = await fetch("/api/saved-posts", { credentials: "include" });
      const data = await res.json();
      setSavedPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching saved posts:", error);
    }
  }, []);

  const fetchJoinedPosts = React.useCallback(async () => {
    try {
      const res = await fetch("/api/participants/my-events", { credentials: "include" });
      const data = await res.json();
      setJoinedPosts(data.posts || []);
    } catch (error) {
      console.error("Error fetching joined posts:", error);
    }
  }, []);

  React.useEffect(() => {
    fetchPosts();
    fetchSavedPosts();
    fetchJoinedPosts();
  }, [fetchPosts, fetchSavedPosts, fetchJoinedPosts]);

  React.useEffect(() => {
    if (!isPending && !session) navigate("/auth");
  }, [session, isPending, navigate]);

  // Close menu when clicking outside
  React.useEffect(() => {
    const handler = () => setOpenMenuId(null);
    document.addEventListener("click", handler);
    return () => document.removeEventListener("click", handler);
  }, []);

  if (isPending) {
    return (
      <div className="flex items-center justify-center h-full">
        <p className="text-gray-400 animate-pulse">Loading...</p>
      </div>
    );
  }

  if (!session) return null;

  const formatDateTime = (isoString: string) =>
    new Date(isoString).toLocaleString("en-US", {
      month: "short", day: "numeric", year: "numeric",
      hour: "numeric", minute: "2-digit", hour12: true,
    });

  const formatDate = (isoString: string) =>
    new Date(isoString).toLocaleDateString("en-US", {
      month: "2-digit", day: "2-digit", year: "numeric",
    });

  const tabs: { value: TabValue; label: string }[] = [
    { value: "created", label: "Created Events" },
    { value: "saved", label: "Saved Events" },
    { value: "joined", label: "Joined Events" },
  ];

  // Shared dropdown menu for table rows
  const RowMenu = ({
    postId,
    post,
    type,
  }: {
    postId: number;
    post: PostData;
    type: "created" | "saved" | "joined";
  }) => {
    const isOpen = openMenuId === postId;

    return (
      <div className="relative">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setOpenMenuId(isOpen ? null : postId);
          }}
          className="p-1.5 rounded text-gray-400 hover:text-white hover:bg-gray-700 transition-colors"
        >
          <MoreHorizontal20Regular />
        </button>

        {isOpen && (
          <div className="absolute right-0 z-50 mt-1 w-52 bg-[#2d2d2d] border border-gray-700 rounded-lg shadow-xl overflow-hidden">
            {type === "created" && (
              <>
                <button
                  onClick={() => {
                    handleDownloadAttendance(postId);
                    setOpenMenuId(null);
                  }}
                  disabled={downloadingAttendance === postId}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 disabled:opacity-50 transition-colors"
                >
                  <DocumentArrowDown20Regular />
                  {downloadingAttendance === postId ? "Downloading..." : "Download Attendance"}
                </button>
                <hr className="border-gray-700" />
                <button
                  onClick={() => {
                    setCurrentEditingPost(post);
                    setEditModalState("modal");
                    setOpenMenuId(null);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <EditRegular />
                  Edit
                </button>
                <a
                  href={`/post?id=${postId}`}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <EyeRegular />
                  View Post
                </a>
                <hr className="border-gray-700" />
                <button
                  onClick={() => {
                    setDeletePostId(postId);
                    setDeleteModalState("modal");
                    setOpenMenuId(null);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-red-400 hover:bg-red-900/30 transition-colors"
                >
                  <DeleteRegular />
                  Delete
                </button>
              </>
            )}

            {type === "saved" && (
              <a
                href={`/post?id=${postId}`}
                className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
              >
                <EyeRegular />
                View Post
              </a>
            )}

            {type === "joined" && (
              <>
                <button
                  onClick={() => {
                    setSelectedEvent(post);
                    setShowCalendarExport(true);
                    setOpenMenuId(null);
                  }}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <CalendarAddRegular />
                  Add to Calendar
                </button>
                <a
                  href={`/post?id=${postId}`}
                  className="flex items-center gap-2 w-full px-4 py-2.5 text-sm text-gray-300 hover:bg-gray-700 transition-colors"
                >
                  <EyeRegular />
                  View Post
                </a>
              </>
            )}
          </div>
        )}
      </div>
    );
  };

  const TableShell = ({ children }: { children: React.ReactNode }) => (
    <div className="overflow-x-auto rounded-lg border border-gray-700 mt-4">
      <table className="min-w-full">
        <thead className="bg-[#242424]">
          <tr>
            {["Title", "Location", "Created On", "Starts", "Ends", "Participants", "Actions"].map((col) => (
              <th key={col} className={thClass}>{truncate(col, isMobile)}</th>
            ))}
          </tr>
        </thead>
        <tbody className="bg-[#2d2d2d]">{children}</tbody>
      </table>
    </div>
  );

  const TableRow = ({ post, type }: { post: PostData; type: "created" | "saved" | "joined" }) => (
    <tr className="hover:bg-[#333] transition-colors">
      <td className={tdClass}>{truncate(post.title, isMobile)}</td>
      <td className={tdClass}>{truncate(post.location, isMobile)}</td>
      <td className={tdClass}>{truncate(formatDate(post.created_at), isMobile)}</td>
      <td className={tdClass}>{truncate(formatDateTime(post.start_datetime), isMobile)}</td>
      <td className={tdClass}>{truncate(formatDateTime(post.end_datetime), isMobile)}</td>
      <td className={tdClass}>{post.current_participants}/{post.max_participants}</td>
      <td className={tdClass}>
        <RowMenu postId={post.id} post={post} type={type} />
      </td>
    </tr>
  );

  return (
    <div className="flex flex-col gap-4">
      {/* Tabs */}
      <div className="flex border-b border-gray-700">
        {tabs.map((tab) => (
          <button
            key={tab.value}
            onClick={() => setActiveTab(tab.value)}
            className={`px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px ${
              activeTab === tab.value
                ? "border-blue-500 text-blue-400"
                : "border-transparent text-gray-400 hover:text-white"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Created Events */}
      {activeTab === "created" && (
        <div className="flex flex-col gap-4">
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-semibold text-white">Manage Events</h1>
            <button
              onClick={() => setCreateModalState("modal")}
              className="text-blue-400 hover:text-blue-300 transition-colors"
              title="Create new event"
            >
              <AddCircle32Color />
            </button>
          </div>

          {loading ? (
            <p className="text-gray-400 animate-pulse text-sm">Loading posts...</p>
          ) : posts.length === 0 ? (
            <p className="text-gray-400 text-sm mt-4">
              No posts yet. Create your first event!
            </p>
          ) : (
            <TableShell>
              {posts.map((post) => (
                <TableRow key={post.id} post={post} type="created" />
              ))}
            </TableShell>
          )}
        </div>
      )}

      {/* Saved Events */}
      {activeTab === "saved" && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-white">Saved Events</h1>
          {savedPosts.length === 0 ? (
            <p className="text-gray-400 text-sm mt-4">
              No saved events yet. Browse events and save your favorites!
            </p>
          ) : (
            <TableShell>
              {savedPosts.map((post) => (
                <TableRow key={post.id} post={post} type="saved" />
              ))}
            </TableShell>
          )}
        </div>
      )}

      {/* Joined Events */}
      {activeTab === "joined" && (
        <div className="flex flex-col gap-4">
          <h1 className="text-2xl font-semibold text-white">Events You've Joined</h1>
          {joinedPosts.length === 0 ? (
            <p className="text-gray-400 text-sm mt-4">
              You haven't joined any events yet. Browse events and sign up!
            </p>
          ) : (
            <TableShell>
              {joinedPosts.map((post) => (
                <TableRow key={post.id} post={post} type="joined" />
              ))}
            </TableShell>
          )}
        </div>
      )}

      <YourPostsDialogs
        createModalState={createModalState}
        setCreateModalState={setCreateModalState}
        editModalState={editModalState}
        setEditModalState={setEditModalState}
        deleteModalState={deleteModalState}
        setDeleteModalState={setDeleteModalState}
        deletePostId={deletePostId}
        currentEditingPost={currentEditingPost}
        selectedEvent={selectedEvent}
        setSelectedEvent={setSelectedEvent}
        showCalendarExport={showCalendarExport}
        setShowCalendarExport={setShowCalendarExport}
        session={session}
        onPostCreated={fetchPosts}
        onPostUpdated={fetchPosts}
        onPostDeleted={fetchPosts}
        isMobile={isMobile}
      />
    </div>
  );
}

export default YourPosts;