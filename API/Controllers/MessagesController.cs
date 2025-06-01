using System;
using API.DTOs;
using API.Entities;
using API.Extensions;
using API.Helpers;
using API.Interfaces;
using AutoMapper;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http.HttpResults;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers;

[Authorize]
public class MessagesController(IUnitOfWork unitOfWork, IMapper mapper) : BaseApiController
{
    [HttpPost]
    public async Task<ActionResult<MessageDto>> CreateMessage(CreateMessageDto createMessageDto)
    {
        var username = User.GetUsername();
        if (username.Equals(createMessageDto.RecipientUserName, StringComparison.CurrentCultureIgnoreCase))
            return BadRequest("You cannot send messages to yourself");

        var sender = await unitOfWork.UserRepository.GetUserByUsernameAsync(username);
        var recipient = await unitOfWork.UserRepository.GetUserByUsernameAsync(createMessageDto.RecipientUserName);

        if (recipient == null || sender == null || sender.UserName == null || recipient.UserName == null) return NotFound();

        var message = new Message
        {
            Sender = sender,
            Recipient = recipient,
            SenderUserName = sender.UserName,
            RecipientUserName = recipient.UserName,
            Content = createMessageDto.Content
        };

        unitOfWork.MessageRepository.AddMessage(message);

        if (await unitOfWork.Complete()) return Ok(mapper.Map<MessageDto>(message));

        return BadRequest("Failed to save message");
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessagesForUser([FromQuery] MessageParams messageParams)
    {
        messageParams.UserName = User.GetUsername();
        var messages = await unitOfWork.MessageRepository.GetMessagesForUser(messageParams);
        Response.AddPaginationHeader(messages);

        return messages;
    }

    [HttpGet("thread/{username}")]
    public async Task<ActionResult<IEnumerable<MessageDto>>> GetMessageThread(string username)
    {
        var currentUsername = User.GetUsername();
        return Ok(await unitOfWork.MessageRepository.GetMessageThread(currentUsername, username));
    }

    [HttpGet("{id}")]
    public async Task<ActionResult<MessageDto>> GetMessage(int id)
    {
        return await unitOfWork.MessageRepository.GetMessage(id) switch
        {
            null => NotFound(),
            var message => Ok(mapper.Map<MessageDto>(message))
        };
    }

    [HttpDelete("{id}")]
    public async Task<ActionResult> DeleteMessage(int id)
    {
        var username = User.GetUsername();
        var message = await unitOfWork.MessageRepository.GetMessage(id);

        if (message == null) return BadRequest("cannot delete the message");

        if (message.SenderUserName != username && message.RecipientUserName != username)
            return Unauthorized();

        if (message.SenderUserName == username) message.SenderDeleted = true;
        if (message.RecipientUserName == username) message.RecipientDeleted = true;

        if (message.SenderDeleted && message.RecipientDeleted)
            unitOfWork.MessageRepository.DeleteMessage(message);

        if (await unitOfWork.Complete()) return Ok();

        return BadRequest("Problem deleting the message");
    }

}