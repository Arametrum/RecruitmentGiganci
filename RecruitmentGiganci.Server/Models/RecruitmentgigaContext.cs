using Microsoft.EntityFrameworkCore;
using RecruitmentGiganci.Server.Models;
using System;
using System.Collections.Generic;

namespace RecruitmentGiganci.Server;

public partial class RecruitmentgigaContext : DbContext
{
    public RecruitmentgigaContext()
    {
    }

    public RecruitmentgigaContext(DbContextOptions<RecruitmentgigaContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Chat> Chats { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder)
        => optionsBuilder.UseSqlServer("Data Source=sql.bsite.net\\MSSQL2016;Initial Catalog=recruitmentgiga_;Persist Security Info=True;User ID=recruitmentgiga_;Password=RecruitmentGiga;Trust Server Certificate=True");
    //This obviously shouldn't be in the source code, but is here for the sake of the recruitment task

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Chat>(entity =>
        {
            entity.HasKey(e => e.Id).HasName("PK__Chats__3214EC076C4E8209");

            entity.Property(e => e.Name).HasMaxLength(100);
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
