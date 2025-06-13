using System;
using System.Collections.Generic;

namespace RecruitmentGiganci.Server.Models;

public partial class Message
{
    public int Id { get; set; }

    public int ChatId { get; set; }

    public string Content { get; set; } = null!;

    public int Opinion { get; set; }

    public bool IsAi { get; set; }
}
