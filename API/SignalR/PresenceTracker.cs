using System;
using Microsoft.EntityFrameworkCore.Storage.ValueConversion;

namespace API.SignalR;

public class PresenceTracker
{
    private static readonly Dictionary<string, List<string>> OnlineUsers = [];

    public Task<bool> UserConnected(string username, string connectionId)
    {
        var isOnline = false;
        lock (OnlineUsers)
        {
            if (OnlineUsers.TryGetValue(username, out List<string>? value))
                value.Add(connectionId);
            else
            {
                OnlineUsers[username] = [connectionId];
                isOnline = true;
            }
        }

        return Task.FromResult(isOnline);
    }

    public Task<bool> UserDisconnected(string username, string connectionId)
    {
        var isoffline = false;

        lock (OnlineUsers)
        {
            if (!OnlineUsers.TryGetValue(username, out List<string>? value)) return Task.FromResult(isoffline);
            value.Remove(connectionId);

            if (value.Count == 0)
            {
                isoffline = true;
                OnlineUsers.Remove(username);
            }
        }

        return Task.FromResult(isoffline);
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

    public static Task<List<string>> GetConnectionsForUser(string username)
    {
        lock (OnlineUsers)
        {
            if (OnlineUsers.TryGetValue(username, out List<string>? connections))
            {
                return Task.FromResult(connections);
            }
        }

        return Task.FromResult(new List<string>());
    }


}

