using System;
using API.DTOs;
using API.Entities;
using API.Helpers;

namespace API.Interfaces;

public interface IMessageRepository
{
    public void AddMessage(Message message);
    void DeleteMessage(Message message);
    Task<Message?> GetMessage(int id);
    Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams);
    Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string recipientUserName);
    Task<bool> SaveAllAsync();
}
