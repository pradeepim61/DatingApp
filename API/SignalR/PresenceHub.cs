using System;
using API.Extensions;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;

namespace API.SignalR;

[Authorize]
public class PresenceHub(PresenceTracker presenceTracker) : Hub
{
    public override async Task OnConnectedAsync()
    {
        if (Context.User == null) throw new HubException("Cannot get current user claim");

        var online = await presenceTracker.UserConnected(Context.User.GetUsername(), Context.ConnectionId);
        if(online) await Clients.Others.SendAsync("UsersIsOnline", Context.User?.GetUsername());

        var currentUsers = await presenceTracker.GetOnlineUsers();
        await Clients.Caller.SendAsync("GetOnlineUsers", currentUsers);
    }

    public override async Task OnDisconnectedAsync(Exception? exception)
    {
        if (Context.User == null) throw new HubException("Cannot get current user claim");

        var isoffline = await presenceTracker.UserDisconnected(Context.User.GetUsername(), Context.ConnectionId);

        if (isoffline)
            await Clients.Others.SendAsync("UsersIsOffline", Context.User?.GetUsername());

        // var currentUsers = await presenceTracker.GetOnlineUsers();
        // await Clients.All.SendAsync("GetOnlineUsers", currentUsers);

        await base.OnDisconnectedAsync(exception);
    }
}
