using System;
using API.DTOs;
using API.Entities;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using AutoMapper.QueryableExtensions;
using Microsoft.EntityFrameworkCore;

namespace API.Data;

public class MessageRepository(DataContext context, IMapper mapper) : IMessageRepository
{
    public void AddMessage(Message message)
    {
        context.Messages.Add(message);
    }

    public void DeleteMessage(Message message)
    {
        context.Messages.Remove(message);
    }

    public async Task<Message?> GetMessage(int id)
    {
        return await context.Messages.FindAsync(id);
    }

    public  async Task<PagedList<MessageDto>> GetMessagesForUser(MessageParams messageParams)
    {
        var query = context.Messages.OrderByDescending(m => m.MessageSent).AsQueryable();

        query = messageParams.Container switch
        {
            "Inbox" => query.Where(u => u.RecipientUserName == messageParams.UserName && u.RecipientDeleted == false),
            "Outbox" => query.Where(u => u.SenderUserName == messageParams.UserName && u.SenderDeleted == false),
            _ => query.Where(u => u.RecipientUserName == messageParams.UserName && !u.DateRead.HasValue && u.RecipientDeleted == false)
        };

        var messages = query.ProjectTo<MessageDto>(mapper.ConfigurationProvider);

        return await PagedList<MessageDto>.CreateAsync(messages, messageParams.PageNumber, messageParams.PageSize);
    }

    public async Task<IEnumerable<MessageDto>> GetMessageThread(string currentUsername, string recipientUserName)
    {
        var messages = await context.Messages
        .Include(m => m.Sender).ThenInclude(x => x.Photos)
        .Include(m => m.Recipient).ThenInclude(x => x.Photos)
        .Where(m => m.RecipientUserName == currentUsername && m.RecipientDeleted == false && 
        m.SenderUserName == recipientUserName
                        || m.RecipientUserName == recipientUserName
                        && m.SenderDeleted == false && m.SenderUserName == currentUsername)
        .OrderBy(m => m.MessageSent)
        .ToListAsync();

        var unreadmessages = messages.Where(x => x.DateRead == null && x.RecipientUserName == currentUsername).ToList();

        if(unreadmessages.Count() != 0){
            unreadmessages.ForEach(x => x.DateRead = DateTime.UtcNow);
            await context.SaveChangesAsync();
        }

        return mapper.Map<IEnumerable<MessageDto>>(messages);
    }

    public async Task<bool> SaveAllAsync()
    {
        return await context.SaveChangesAsync() > 0;
    }
}
