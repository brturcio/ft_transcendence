import { useEffect, useState } from "react";
import { useTranslation } from "react-i18next";
import { useGlobalPresence, type UserStatus } from "../realtime/useGlobalPresence";
import { API_BASE_URL } from "../config/network";

const AUTH_TOKEN_KEY = "ft_auth_token";

type Friend = {
	id: string;
	username: string;
	avatarUrl: string | null;
	status: UserStatus;
};

type FriendRequest = {
	id: string;
	createdAt: string;
	user: { id: string; username: string; avatarUrl: string | null };
};

const statusConfig: Record<UserStatus, { dot: string; text: string; label: string }> = {
	ONLINE: { dot: "bg-green-500", text: "text-green-500", label: "Online" },
	OFFLINE: { dot: "bg-red-500", text: "text-red-500", label: "Offline" },
	INGAME: { dot: "bg-purple-500", text: "text-purple-400", label: "In Game" }
};

export function FriendsManager()
{
	const { t } = useTranslation();
	const realtimeStatuses = useGlobalPresence();
	
	const [friends, setFriends] = useState<Friend[]>([]);
	const [requests, setRequests] = useState<FriendRequest[]>([]);
	const [activeTab, setActiveTab] = useState<"friends" | "requests">("friends");

	const token = localStorage.getItem(AUTH_TOKEN_KEY);

	useEffect(() => {
		if (!token)
			return;

		const fetchData = async () => {
			try
			{
				const resFriends = await fetch(`${API_BASE_URL}/friends`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (resFriends.ok)
				{
					const data = await resFriends.json();
					setFriends(Array.isArray(data) ? data : (data.friends || []));
				}
				const resReq = await fetch(`${API_BASE_URL}/friends/requests`, {
					headers: { Authorization: `Bearer ${token}` }
				});
				if (resReq.ok)
				{
					const reqData = await resReq.json();
					setRequests(reqData.incoming || []);
				}
			}
			catch (err)
			{
				console.error("Erreur chargement amis", err);
			}
		};
		fetchData();
	}, [token]);

	const handleAction = async (endpoint: string, method: "POST" | "DELETE") => {
		try
		{
			await fetch(`${API_BASE_URL}${endpoint}`, {
				method,
				headers: { Authorization: `Bearer ${token}` }
			});
			window.location.reload();
		}
		catch (err)
		{
			console.error(err);
		}
	};

	return (
		<section className="bg-[rgba(9,18,40,0.72)] border border-[rgba(110,210,255,0.18)] rounded-[14px] p-5 shadow-none mt-6">
			<div className="flex gap-4 border-b border-[rgba(110,210,255,0.18)] pb-3 mb-4">
				<button 
					onClick={() => setActiveTab("friends")} 
					className={activeTab === "friends" ? "text-[#6ED2FF] font-bold" : "text-white opacity-70 hover:opacity-100"}
				>
					Friends
				</button>
				<button 
					onClick={() => setActiveTab("requests")} 
					className={activeTab === "requests" ? "text-[#6ED2FF] font-bold" : "text-white opacity-70 hover:opacity-100"}
				>
					Pending Requests ({requests.length})
				</button>
			</div>

			{activeTab === "friends" && (
				<div className="flex flex-col gap-3">
					{friends.length === 0 ? <p className="text-white opacity-50">No friends at the moment.</p> : friends.map(friend => {
						const displayStatus = realtimeStatuses[friend.id] || friend.status || "OFFLINE";
						const config = statusConfig[displayStatus];

						return (
							<div key={friend.id} className="flex justify-between items-center bg-black/30 border border-[rgba(110,210,255,0.1)] p-3 rounded-lg text-white transition-all hover:bg-black/50">
								<div className="flex items-center gap-4">
									<div className="relative">
										<img src={friend.avatarUrl || "/placeholder.png"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
										<span className={`absolute bottom-0 right-0 w-3.5 h-3.5 rounded-full border-2 border-[rgba(9,18,40,1)] ${config.dot}`}></span>
									</div>
									<div className="flex flex-col leading-tight">
										<span className="font-bold text-[15px]">{friend.username}</span>
										<span className={`text-[11px] font-bold tracking-wider uppercase ${config.text}`}>
											{config.label}
										</span>
									</div>
								</div>
								<button onClick={() => handleAction(`/friends/${friend.id}`, "DELETE")} className="text-red-400 text-sm hover:text-red-300 transition-colors">
									Remove
								</button>
							</div>
						);
					})}
				</div>
			)}

			{activeTab === "requests" && (
				<div className="flex flex-col gap-3">0
					{requests.length === 0 ? <p className="text-white opacity-50">No pending requests.</p> : requests.map(req => (
						<div key={req.id} className="flex justify-between items-center bg-black/30 border border-[rgba(110,210,255,0.1)] p-3 rounded-lg text-white">
							<div className="flex items-center gap-3">
								<img src={req.user.avatarUrl || "/placeholder.png"} alt="avatar" className="w-10 h-10 rounded-full object-cover" />
								<span><strong className="text-[#6ED2FF]">{req.user.username}</strong> wants to be your friend</span>
							</div>
							<div className="flex gap-2">
								<button onClick={() => handleAction(`/friends/requests/${req.id}/accept`, "POST")} className="bg-green-600/80 hover:bg-green-500 px-3 py-1.5 rounded text-sm font-semibold transition-colors">Accept</button>
								<button onClick={() => handleAction(`/friends/requests/${req.id}/decline`, "POST")} className="bg-red-600/80 hover:bg-red-500 px-3 py-1.5 rounded text-sm font-semibold transition-colors">Decline</button>
							</div>
						</div>
					))}
				</div>
			)}
		</section>
	);
}