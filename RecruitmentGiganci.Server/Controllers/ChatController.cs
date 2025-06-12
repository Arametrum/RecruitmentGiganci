using Microsoft.AspNetCore.Mvc;
using RecruitmentGiganci.Server.Models;

namespace RecruitmentGiganci.Server.Controllers
{
    [ApiController]
    [Route("[controller]")]
    public class ChatController : ControllerBase
    {

        private readonly ILogger<ChatController> _logger;
        private readonly RecruitmentgigaContext db;

        public ChatController(ILogger<ChatController> logger)
        {
            _logger = logger;
            db = new RecruitmentgigaContext();
        }

        [HttpGet(Name = "GetChatList")]
        public IEnumerable<Chat> GetChatList()
        {            
            return db.Chats.ToList();
        }  

        [HttpPost(Name = "CreateChat")]
        public void CreateChat([FromBody] string chatName)
        {
            // This method is a placeholder for future implementation of chat creation.
            // Currently, it does not return any data or perform any actions.
            _logger.LogInformation($"CreateChat called with chatName: {chatName} but not implemented yet.");
        }


    }
}
