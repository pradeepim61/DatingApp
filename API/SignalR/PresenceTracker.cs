using System;

namespace API.SignalR;

public class PresenceTracker
{
    private readonly Dictionary<string, List<string>> OnlineUsers = [];

    public Task UserConnected(string username, string connectionId)
    {
        lock (OnlineUsers)
        {
            if (OnlineUsers.TryGetValue(username, out List<string>? value))
                value.Add(connectionId);
            else
                OnlineUsers[username] = [connectionId];
        }

        return Task.CompletedTask;
    }

    public Task UserDisconnected(string username, string connectionId)
    {
        lock (OnlineUsers)
        {
            if (!OnlineUsers.TryGetValue(username, out List<string>? value)) return Task.CompletedTask;
            value.Remove(connectionId);

            if (value.Count == 0) OnlineUsers.Remove(username);
        }

        return Task.CompletedTask;
    }

    public Task<string[]> GetOnlineUsers()
    {
        string[] onlineUsers;

        lock (OnlineUsers)
        {
            onlineUsers = [.. OnlineUsers
                .OrderBy(x => x.Key)
                .Select(x => x.Key)];
        }
        return Task.FromResult(onlineUsers);
    }

}

